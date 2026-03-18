export type TeamFormData = {
  id?: string;
  name: string;
  leader: string;
  member1: string;
  member2: string;
  imagePath?: string | null;
};

const PLACEHOLDERS: Record<keyof Omit<TeamFormData, "id" | "imagePath">, string> = {
  name: "チーム名",
  leader: "チームリーダー",
  member1: "メンバー1",
  member2: "メンバー2",
};

const INPUT_CLASS =
  "w-1/4 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

const MOBILE_INPUT_CLASS =
  "w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

interface TeamFormRowProps {
  row: TeamFormData;
  index: number;
  imageFile: File | null;
  onChange: (field: keyof Omit<TeamFormData, "id" | "imagePath">, value: string) => void;
  onDelete: () => void;
  onImageChange: (file: File | null) => void;
}

function ImageInput({
  imageFile,
  hasExisting,
  onImageChange,
}: {
  imageFile: File | null;
  hasExisting: boolean;
  onImageChange: (file: File | null) => void;
}) {
  const label = imageFile
    ? imageFile.name
    : hasExisting
    ? "登録済み（変更する場合は選択）"
    : "画像を選択";

  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
        チーム画像
      </span>
      <label className="cursor-pointer rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
        <span className={imageFile ? "block max-w-[160px] truncate" : undefined}>
          {label}
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
        />
      </label>
      {imageFile && (
        <button
          type="button"
          onClick={() => onImageChange(null)}
          className="shrink-0 text-xs text-red-500 hover:text-red-700"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default function TeamFormRow({
  row,
  index,
  imageFile,
  onChange,
  onDelete,
  onImageChange,
}: TeamFormRowProps) {
  return (
    <>
      {/* モバイル: カードレイアウト */}
      <div className="sm:hidden rounded-lg border border-zinc-100 p-3 space-y-2 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            No.{index + 1}
          </span>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
          >
            削除
          </button>
        </div>
        {(["name", "leader", "member1", "member2"] as const).map((field) => (
          <input
            key={field}
            type="text"
            className={MOBILE_INPUT_CLASS}
            value={row[field]}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={PLACEHOLDERS[field]}
          />
        ))}
        <ImageInput
          imageFile={imageFile}
          hasExisting={!!row.imagePath}
          onImageChange={onImageChange}
        />
      </div>

      {/* タブレット・PC: 横並びレイアウト */}
      <div className="hidden sm:block">
        <div className="flex items-center gap-3">
          <div className="w-6 shrink-0 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {index + 1}
          </div>
          {(["name", "leader", "member1", "member2"] as const).map((field) => (
            <input
              key={field}
              type="text"
              className={INPUT_CLASS}
              value={row[field]}
              onChange={(e) => onChange(field, e.target.value)}
              placeholder={PLACEHOLDERS[field]}
            />
          ))}
          <button
            type="button"
            onClick={onDelete}
            className="shrink-0 whitespace-nowrap rounded-md border border-red-300 px-2 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
          >
            削除
          </button>
        </div>
        <div className="pl-9 pt-1">
          <ImageInput
            imageFile={imageFile}
            hasExisting={!!row.imagePath}
            onImageChange={onImageChange}
          />
        </div>
      </div>
    </>
  );
}
