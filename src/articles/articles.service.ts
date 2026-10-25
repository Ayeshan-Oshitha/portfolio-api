import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { PaginatedResult } from '../common/responses/paginated-result.js';
import { slugify } from '../common/utils/slugify.js';
import { Prisma } from '../generated/prisma/client.js';
import type { CurrentUser } from '../auth/approved-user.guard.js';
import type { CreateArticleDto } from './dto/create-article.dto.js';
import type { UpdateArticleDto } from './dto/update-article.dto.js';
import type { ArticleCategory } from '../generated/prisma/enums.js';

const articleInclude = {
  coverMedia: { select: { key: true } },
  tags: {
    select: { tag: { select: { id: true, name: true, slug: true, iconSlug: true, color: true } } },
  },
} satisfies Prisma.ArticleInclude;
type ArticleWithRelations = Prisma.ArticleGetPayload<{ include: typeof articleInclude }>;

const publicArticleInclude = {
  ...articleInclude,
  owner: { select: { id: true, name: true, image: true } },
} satisfies Prisma.ArticleInclude;

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // Create a draft article owned by the current user; the slug is generated from the title.
  public async create(user: CurrentUser, dto: CreateArticleDto) {
    const { tagIds, ...data } = dto;
    this.assertContentOrLink(data.content, data.externalUrl);
    await this.assertOwnMedia(user, data.coverMediaId);
    await this.assertTagsExist(tagIds);

    try {
      const article = await this.prisma.article.create({
        data: {
          ...data,
          slug: await this.uniqueSlug(user.id, data.title),
          ownerId: user.id,
          tags: tagIds ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
        },
        include: articleInclude,
      });
      return this.toResponse(article);
    } catch (error) {
      this.handleError(error);
    }
  }

  // List the current user's articles, newest first, with pagination.
  public async findAll(user: CurrentUser, page: number, limit: number) {
    if (!Number.isSafeInteger(page) || page < 1) {
      throw new BadRequestException('Page must be a positive integer');
    }
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const where: Prisma.ArticleWhereInput = { ownerId: user.id };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        include: articleInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.article.count({ where }),
    ]);

    return new PaginatedResult(
      items.map((a) => this.toResponse(a)),
      { page, limit, total, totalPages: Math.ceil(total / limit) },
    );
  }

  // Get one of the current user's articles.
  public async findOne(user: CurrentUser, id: string) {
    const article = await this.prisma.article.findFirst({
      where: { id, ownerId: user.id },
      include: articleInclude,
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return this.toResponse(article);
  }

  // Update fields; if tagIds is sent, it replaces all current tags. Title changes keep the slug.
  public async update(user: CurrentUser, id: string, dto: UpdateArticleDto) {
    const existing = await this.prisma.article.findFirst({
      where: { id, ownerId: user.id },
      select: { content: true, externalUrl: true },
    });
    if (!existing) {
      throw new NotFoundException('Article not found');
    }
    const { tagIds, ...data } = dto;
    this.assertContentOrLink(
      data.content === undefined ? existing.content : data.content,
      data.externalUrl === undefined ? existing.externalUrl : data.externalUrl,
    );

    await this.assertOwnMedia(user, data.coverMediaId);
    await this.assertTagsExist(tagIds);

    try {
      const article = await this.prisma.article.update({
        where: { id },
        data: {
          ...data,
          tags: tagIds ? { deleteMany: {}, create: tagIds.map((tagId) => ({ tagId })) } : undefined,
        },
        include: articleInclude,
      });
      return this.toResponse(article);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Publish or unpublish; publishedAt is set the first time it goes live.
  public async setPublished(user: CurrentUser, id: string, isPublished: boolean) {
    const existing = await this.assertOwnArticle(user, id);
    const article = await this.prisma.article.update({
      where: { id },
      data: {
        isPublished,
        publishedAt: isPublished && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
      include: articleInclude,
    });
    return this.toResponse(article);
  }

  // Delete one of the current user's articles (its tag links go with it).
  public async remove(user: CurrentUser, id: string) {
    await this.assertOwnArticle(user, id);
    await this.prisma.article.delete({ where: { id } });
    return { id };
  }

  // Public: list published articles from all users, newest first, optionally by tag slug.
  public async findPublished(
    page: number,
    limit: number,
    tagSlug?: string,
    category?: ArticleCategory,
    featured?: boolean,
  ) {
    if (!Number.isSafeInteger(page) || page < 1) {
      throw new BadRequestException('Page must be a positive integer');
    }
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 50) {
      throw new BadRequestException('Limit must be between 1 and 50');
    }

    const where: Prisma.ArticleWhereInput = {
      isPublished: true,
      ...(category ? { category } : {}),
      ...(featured ? { isFeatured: true } : {}),
      ...(tagSlug ? { tags: { some: { tag: { slug: tagSlug } } } } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        include: publicArticleInclude,
        omit: { content: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.article.count({ where }),
    ]);

    return new PaginatedResult(
      items.map(({ owner, ...a }) => ({
        ...this.toResponse({ ...a, content: null }),
        author: owner,
      })),
      { page, limit, total, totalPages: Math.ceil(total / limit) },
    );
  }

  // Public: get one published article with its full content.
  public async findPublishedOne(id: string) {
    const article = await this.prisma.article.findFirst({
      where: { id, isPublished: true },
      include: publicArticleInclude,
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    const { owner, ...rest } = article;
    return { ...this.toResponse(rest), author: owner };
  }

  // Build a slug from the title that the user hasn't used yet (adds -2, -3, ... if needed).
  private async uniqueSlug(ownerId: string, title: string): Promise<string> {
    const base = slugify(title) || 'article';
    const taken = await this.prisma.article.findMany({
      where: { ownerId, slug: { startsWith: base } },
      select: { slug: true },
    });
    const used = new Set(taken.map((a) => a.slug));
    if (!used.has(base)) return base;

    let n = 2;
    while (used.has(`${base}-${n}`)) n++;
    return `${base}-${n}`;
  }

  // 404 unless the article exists and belongs to the current user.
  private async assertOwnArticle(user: CurrentUser, id: string) {
    const article = await this.prisma.article.findFirst({
      where: { id, ownerId: user.id },
      select: { id: true, publishedAt: true },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  // Only allow a cover image from the current user's media library.
  private async assertOwnMedia(user: CurrentUser, mediaId?: string | null) {
    if (!mediaId) return;
    const media = await this.prisma.media.findFirst({ where: { id: mediaId, ownerId: user.id } });
    if (!media) {
      throw new BadRequestException('Cover media not found in your library');
    }
  }

  // Reject unknown tag IDs.
  private async assertTagsExist(tagIds?: string[]) {
    if (!tagIds?.length) return;
    const count = await this.prisma.tag.count({ where: { id: { in: tagIds } } });
    if (count !== tagIds.length) {
      throw new BadRequestException('One or more tags do not exist');
    }
  }

  // Add coverUrl and flatten tags for the client.
  private toResponse({ coverMedia, tags, ...article }: ArticleWithRelations) {
    return {
      ...article,
      coverUrl: coverMedia ? this.storage.getPublicUrl(coverMedia.key) : null,
      tags: tags.map((t) => t.tag),
    };
  }

  // An article needs its own content or an external (e.g. Medium) link.
  private assertContentOrLink(content?: string | null, externalUrl?: string | null) {
    if (!content && !externalUrl) {
      throw new BadRequestException('Add article content or an external URL');
    }
  }

  // Turn Prisma errors into HTTP errors.
  private handleError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002')
        throw new ConflictException('You already have an article with this slug');
      if (error.code === 'P2003')
        throw new BadRequestException('One or more tags or the cover no longer exist');
      if (error.code === 'P2025') throw new NotFoundException('Article not found');
    }
    throw error;
  }
}
