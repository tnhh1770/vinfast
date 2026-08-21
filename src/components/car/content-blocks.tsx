import Image from "next/image";

import { CarGallery } from "@/components/car/car-gallery";
import { cn } from "@/lib/utils";
import type { ContentBlock } from "@/types";

type ImageBlock = Extract<ContentBlock, { type: "image" }>;

type RenderItem =
  | { kind: "block"; block: ContentBlock }
  | { kind: "gallery"; images: ImageBlock[] };

interface ContentBlocksProps {
  blocks: ContentBlock[];
  imageAltPrefix?: string;
  className?: string;
  priorityFirstImage?: boolean;
  /** Tắt khi ảnh cần hiển thị lớn (ví dụ bảng thông số dạng infographic). */
  groupImages?: boolean;
}

/** Gom các ảnh liên tiếp (từ 3 ảnh trở lên) thành lưới cho gọn trang. */
function groupBlocks(blocks: ContentBlock[]): RenderItem[] {
  const items: RenderItem[] = [];
  let run: ImageBlock[] = [];

  const flush = () => {
    if (run.length >= 3) {
      items.push({ kind: "gallery", images: run });
    } else {
      run.forEach((image) => items.push({ kind: "block", block: image }));
    }
    run = [];
  };

  for (const block of blocks) {
    if (block.type === "image") {
      run.push(block);
      continue;
    }
    flush();
    items.push({ kind: "block", block });
  }
  flush();

  return items;
}

export function ContentBlocks({
  blocks,
  imageAltPrefix = "",
  className,
  priorityFirstImage = false,
  groupImages = true,
}: ContentBlocksProps) {
  const items = groupImages
    ? groupBlocks(blocks)
    : blocks.map((block) => ({ kind: "block" as const, block }));

  // Số thứ tự ảnh dùng cho alt tự sinh khi bản gốc để trống.
  const imageOrder = new Map<ContentBlock, number>();
  let counter = 0;
  for (const block of blocks) {
    if (block.type === "image") {
      counter += 1;
      imageOrder.set(block, counter);
    }
  }

  const altFor = (image: ImageBlock) =>
    image.alt?.trim() ||
    `${imageAltPrefix} - hình ${imageOrder.get(image) ?? 1}`.trim().replace(/^- /, "");

  return (
    <div className={cn("prose-vi space-y-5", className)}>
      {items.map((item, index) =>
        item.kind === "gallery" ? (
          <CarGallery
            key={`gallery-${index}`}
            name={imageAltPrefix || "Hình ảnh"}
            images={item.images.map((image) => ({
              src: image.src,
              alt: altFor(image),
            }))}
          />
        ) : (
          <Block
            key={`block-${index}`}
            block={item.block}
            alt={item.block.type === "image" ? altFor(item.block) : ""}
            eager={
              priorityFirstImage &&
              item.block.type === "image" &&
              imageOrder.get(item.block) === 1
            }
          />
        ),
      )}
    </div>
  );
}

function Block({
  block,
  alt,
  eager,
}: {
  block: ContentBlock;
  alt: string;
  eager: boolean;
}) {
  switch (block.type) {
    case "heading": {
      const level = Math.min(Math.max(block.level ?? 3, 2), 5);
      const Tag = `h${level}` as "h2" | "h3" | "h4" | "h5";
      return (
        <Tag
          className={cn(
            "pt-2 font-bold text-ink",
            level === 2 && "text-2xl sm:text-[28px]",
            level === 3 && "text-xl sm:text-2xl",
            level >= 4 && "text-lg",
          )}
        >
          {block.text}
        </Tag>
      );
    }

    case "paragraph":
      return block.html ? (
        <p
          className="leading-8 text-ink-soft"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      ) : (
        <p className="leading-8 text-ink-soft">{block.text}</p>
      );

    case "image": {
      const width = block.width ?? 1200;
      const height = block.height ?? 800;
      return (
        <figure
          className="mx-auto overflow-hidden rounded-2xl bg-muted"
          style={{ maxWidth: Math.min(width, 900) }}
        >
          <Image
            src={block.src}
            alt={alt}
            width={width}
            height={height}
            sizes="(max-width: 1024px) 100vw, 760px"
            loading={eager ? "eager" : "lazy"}
            className="h-auto w-full object-contain"
          />
        </figure>
      );
    }

    case "caption":
      return <p className="text-center text-sm italic text-ink-soft">{block.text}</p>;

    case "list":
      return block.ordered ? (
        <ol className="list-decimal space-y-2 pl-6 text-ink-soft marker:font-semibold marker:text-brand">
          {block.items.map((item, i) => (
            <li key={i} className="leading-7" dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ol>
      ) : (
        <ul className="space-y-2 text-ink-soft">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2.5 leading-7">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
              <span dangerouslySetInnerHTML={{ __html: item }} />
            </li>
          ))}
        </ul>
      );

    case "table":
      return <SpecTable rows={block.rows} />;

    case "quote":
      return (
        <blockquote className="border-l-4 border-brand bg-brand-soft/60 px-5 py-4 leading-8 text-ink-soft">
          {block.text}
        </blockquote>
      );

    default:
      return null;
  }
}

export function SpecTable({ rows }: { rows: string[][] }) {
  if (!rows.length) return null;
  const [head, ...body] = rows;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[480px] text-sm">
        <thead className="bg-brand text-white">
          <tr>
            {head.map((cell, index) => (
              <th key={index} scope="col" className="px-4 py-3 text-left font-semibold">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {body.map((row, rowIndex) => {
            const isGroup = row.filter(Boolean).length === 1;
            return (
              <tr
                key={rowIndex}
                className={cn(isGroup ? "bg-muted font-bold text-ink" : "odd:bg-muted/30")}
              >
                {row.map((cell, cellIndex) =>
                  cellIndex === 0 ? (
                    <th
                      key={cellIndex}
                      scope="row"
                      colSpan={isGroup ? row.length : 1}
                      className="px-4 py-2.5 text-left font-medium text-ink"
                    >
                      {cell}
                    </th>
                  ) : isGroup ? null : (
                    <td key={cellIndex} className="px-4 py-2.5 text-ink-soft">
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
