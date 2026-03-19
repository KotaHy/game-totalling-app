"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { TotalEntry } from "./ScoreRankingTable";
import { TeamWithMembers } from "./TeamListModal";

interface ResultImageModalProps {
  eventName: string;
  totals: TotalEntry[];
  teams: TeamWithMembers[];
  onClose: () => void;
}

const RANK_COLOR: Record<number, string> = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#CD7F32",
};

const RANK_LABEL: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
};

async function fetchSignedDataUrl(imagePath: string): Promise<string | null> {
  try {
    const res = await fetch(
      `/api/storage/sign?path=${encodeURIComponent(imagePath)}`
    );
    const body = await res.json();
    if (!body.signedUrl) return null;

    // 署名付き URL から画像を取得して base64 に変換
    const imgRes = await fetch(body.signedUrl);
    if (!imgRes.ok) return null;
    const blob = await imgRes.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

interface PodiumTeamProps {
  entry: TotalEntry;
  rank: number;
  dataUrl: string | null;
  imgWidth: number;
  imgHeight: number;
  nameFontSize: number;
  scoreFontSize: number;
}

function PodiumTeam({
  entry,
  rank,
  dataUrl,
  imgWidth,
  imgHeight,
  nameFontSize,
  scoreFontSize,
}: PodiumTeamProps) {
  const color = RANK_COLOR[rank] ?? "#fff";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          fontSize: rank === 1 ? 36 : 28,
          fontWeight: 900,
          color,
          textShadow: `0 0 20px ${color}`,
          letterSpacing: 2,
        }}
      >
        {RANK_LABEL[rank]}
      </div>

      <div
        style={{
          width: imgWidth,
          height: imgHeight,
          borderRadius: 12,
          border: `4px solid ${color}`,
          boxShadow: `0 0 30px ${color}80`,
          overflow: "hidden",
          background: "#1a1a2e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt={entry.teamName}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <span style={{ fontSize: 48, color: "#555" }}>?</span>
        )}
      </div>

      <div
        style={{
          fontSize: nameFontSize,
          fontWeight: 700,
          color: "#fff",
          textShadow: "0 2px 8px rgba(0,0,0,0.8)",
          textAlign: "center",
          maxWidth: imgWidth + 40,
        }}
      >
        {entry.teamName || "(不明)"}
      </div>

      <div
        style={{
          fontSize: scoreFontSize,
          fontWeight: 600,
          color,
        }}
      >
        {entry.total} pt
      </div>
    </div>
  );
}

export default function ResultImageModal({
  eventName,
  totals,
  teams,
  onClose,
}: ResultImageModalProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  // teamId → base64 data URL
  const [dataUrlMap, setDataUrlMap] = useState<Map<string, string | null>>(
    new Map()
  );
  const [loadingImages, setLoadingImages] = useState(true);

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setBgImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const imagePathMap = new Map(teams.map((t) => [t.teamId, t.imagePath]));
  const top3Ids = totals.slice(0, 3).map((t) => t.teamId);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingImages(true);
      const entries = await Promise.all(
        top3Ids.map(async (teamId) => {
          const imagePath = imagePathMap.get(teamId);
          if (!imagePath) return [teamId, null] as [string, null];
          const dataUrl = await fetchSignedDataUrl(imagePath);
          return [teamId, dataUrl] as [string, string | null];
        })
      );
      if (!cancelled) {
        setDataUrlMap(new Map(entries));
        setLoadingImages(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const first = totals[0];
  const second = totals[1];
  const third = totals[2];
  const rest = totals.slice(3);

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(canvasRef.current, {
        width: 1920,
        height: 1080,
        cacheBust: false,
        pixelRatio: 1,
      });
      const link = document.createElement("a");
      link.download = `result_${eventName || "ranking"}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const scale = 0.5;

  const ResultCanvas = (
    <div
      ref={canvasRef}
      style={{
        width: 1920,
        height: 1080,
        background: bgImageUrl
          ? `url(${bgImageUrl}) center/cover no-repeat`
          : "linear-gradient(135deg, #0d0d1a 0%, #1a1a3e 50%, #0d0d1a 100%)",
        fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* decorative background lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.02) 80px, rgba(255,255,255,0.02) 81px)",
          pointerEvents: "none",
        }}
      />

      {/* Event name */}
      <div
        style={{
          marginTop: 30,
          fontSize: 56,
          fontWeight: 900,
          color: "#FFD700",
          textShadow:
            "0 0 40px rgba(255,215,0,0.6), 0 4px 16px rgba(0,0,0,0.8)",
          letterSpacing: 8,
          zIndex: 1,
        }}
      >
        {eventName || "イベント結果"}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 22,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: 4,
          zIndex: 1,
        }}
      >
        FINAL RANKING
      </div>

      {/* Podium */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 80,
          marginTop: 30,
          paddingBottom: 320,
          zIndex: 1,
          flex: 1,
        }}
      >
        {second && (
          <PodiumTeam
            entry={second}
            rank={2}
            dataUrl={dataUrlMap.get(second.teamId) ?? null}
            imgWidth={426}
            imgHeight={240}
            nameFontSize={28}
            scoreFontSize={22}
          />
        )}

        {first && (
          <PodiumTeam
            entry={first}
            rank={1}
            dataUrl={dataUrlMap.get(first.teamId) ?? null}
            imgWidth={640}
            imgHeight={360}
            nameFontSize={34}
            scoreFontSize={26}
          />
        )}

        {third && (
          <PodiumTeam
            entry={third}
            rank={3}
            dataUrl={dataUrlMap.get(third.teamId) ?? null}
            imgWidth={426}
            imgHeight={240}
            nameFontSize={28}
            scoreFontSize={22}
          />
        )}
      </div>

      {/* 4th+ table: 3行ごとに列を分割 */}
      {rest.length > 0 && (() => {
        const ROWS_PER_COL = 5;
        const chunks: typeof rest[] = [];
        for (let i = 0; i < rest.length; i += ROWS_PER_COL) {
          chunks.push(rest.slice(i, i + ROWS_PER_COL));
        }
        return (
          <div
            style={{
              position: "absolute",
              bottom: 30,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#000",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: "24px 24px",
              display: "flex",
              gap: 15,
            }}
          >
            {chunks.map((chunk, ci) => (
              <table key={ci} style={{ borderCollapse: "collapse" }}>
                <tbody>
                  {chunk.map((t, ri) => {
                    const rank = ci * ROWS_PER_COL + ri + 4;
                    return (
                      <tr key={t.teamId}>
                        <td
                          style={{
                            padding: "8px 16px 8px 0",
                            fontSize: 18,
                            fontWeight: 550,
                            color: "#fff",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {rank}位
                        </td>
                        <td
                          style={{
                            padding: "8px 0",
                            fontSize: 17,
                            color: "#fff",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {(() => {
                            const name = t.teamName || "(不明)";
                            return name.length >= 22 ? name.slice(0, 22) + "..." : name;
                          })()}
                        </td>
                        <td
                          style={{
                            padding: "8px 8px 8px 8px",
                            fontSize: 15,
                            color: "#fff",
                            textAlign: "right",
                            whiteSpace: "nowrap",
                            ...(ci < chunks.length - 1 && {
                              borderRight: "1px solid rgba(255,255,255)",
                            }),
                          }}
                        >
                          {t.total} pt
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ))}
          </div>
        );
      })()}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <div
        className="flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {loadingImages ? (
          <div className="text-white text-sm">画像を読み込み中...</div>
        ) : (
          <div
            style={{
              position: "relative",
              width: 1920 * scale,
              height: 1080 * scale,
              overflow: "hidden",
              borderRadius: 8,
              boxShadow: "0 0 60px rgba(0,0,0,0.8)",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 1920,
                height: 1080,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              {ResultCanvas}
            </div>

            {/* 背景変更ボタン */}
            <button
              type="button"
              onClick={() => bgInputRef.current?.click()}
              title="背景画像を変更"
              style={{
                position: "absolute",
                bottom: 10,
                left: 10,
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#fff",
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🖊
            </button>
            <input
              ref={bgInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBgChange}
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || loadingImages}
            className="rounded-md bg-yellow-500 px-6 py-2 text-sm font-semibold text-black shadow-lg transition hover:bg-yellow-400 disabled:opacity-60"
          >
            {downloading ? "生成中..." : "PNG ダウンロード"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-zinc-700 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-600"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
