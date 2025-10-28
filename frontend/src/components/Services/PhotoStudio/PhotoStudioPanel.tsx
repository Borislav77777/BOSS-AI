import { fileToBase64, generateImg2Img, generateTxt2Img } from '@/services/photo-studio-api';
import React, { useMemo, useState } from 'react';

type Props = {
    defaults?: Partial<{
        baseUrl: string;
        sampler: string;
        steps: number;
        cfgScale: number;
        width: number;
        height: number;
    }>;
};

export const PhotoStudioPanel: React.FC<Props> = ({ defaults = {} }) => {
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [baseUrl, setBaseUrl] = useState(defaults.baseUrl || 'http://127.0.0.1:7860');
    const [steps, setSteps] = useState<number>(defaults.steps ?? 28);
    const [sampler, setSampler] = useState(defaults.sampler || 'Euler a');
    const [cfgScale, setCfgScale] = useState<number>(defaults.cfgScale ?? 7);
    const [width, setWidth] = useState<number>(defaults.width ?? 512);
    const [height, setHeight] = useState<number>(defaults.height ?? 512);
    const [seed, setSeed] = useState<number>(-1);
    const [denoise, setDenoise] = useState<number>(0.6);
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [images, setImages] = useState<string[]>([]);

    const isImg2Img = useMemo(() => !!file, [file]);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null;
        setFile(f);
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setImages([]);
        try {
            if (!prompt.trim()) {
                throw new Error('Введите промпт');
            }

            if (isImg2Img && file) {
                const b64 = await fileToBase64(file);
                const res = await generateImg2Img({
                    baseUrl,
                    prompt,
                    negative_prompt: negativePrompt,
                    steps,
                    sampler_name: sampler,
                    cfg_scale: cfgScale,
                    width,
                    height,
                    seed,
                    init_images: [b64],
                    denoising_strength: denoise
                });
                setImages(res.images || []);
            } else {
                const res = await generateTxt2Img({
                    baseUrl,
                    prompt,
                    negative_prompt: negativePrompt,
                    steps,
                    sampler_name: sampler,
                    cfg_scale: cfgScale,
                    width,
                    height,
                    seed
                });
                setImages(res.images || []);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Ошибка генерации');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full w-full p-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2 flex flex-col gap-3">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Промпт"
                        className="w-full p-2 rounded bg-surface text-white min-h-[100px]"
                    />
                    <textarea
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="Негативный промпт (optional)"
                        className="w-full p-2 rounded bg-surface text-white min-h-[60px]"
                    />
                    <div className="flex items-center gap-3">
                        <input type="file" accept="image/*" onChange={onFileChange} title="Загрузить фото" />
                        {file && <span className="text-xs text-muted">{file.name}</span>}
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                        <label className="text-sm">Sampler</label>
                        <input
                            className="w-40 p-1 rounded bg-surface-muted"
                            value={sampler}
                            onChange={(e) => setSampler(e.target.value)}
                            title="Sampler"
                            placeholder="Euler a"
                        />
                        <label className="text-sm">Steps</label>
                        <input
                            type="number"
                            className="w-24 p-1 rounded bg-surface-muted"
                            value={steps}
                            onChange={(e) => setSteps(Number(e.target.value))}
                            title="Steps"
                            placeholder="28"
                        />
                        <label className="text-sm">CFG</label>
                        <input
                            type="number"
                            className="w-24 p-1 rounded bg-surface-muted"
                            value={cfgScale}
                            onChange={(e) => setCfgScale(Number(e.target.value))}
                            title="CFG Scale"
                            placeholder="7"
                        />
                        <label className="text-sm">W</label>
                        <input
                            type="number"
                            className="w-24 p-1 rounded bg-surface-muted"
                            value={width}
                            onChange={(e) => setWidth(Number(e.target.value))}
                            title="Width"
                            placeholder="512"
                        />
                        <label className="text-sm">H</label>
                        <input
                            type="number"
                            className="w-24 p-1 rounded bg-surface-muted"
                            value={height}
                            onChange={(e) => setHeight(Number(e.target.value))}
                            title="Height"
                            placeholder="512"
                        />
                        <label className="text-sm">Seed</label>
                        <input
                            type="number"
                            className="w-32 p-1 rounded bg-surface-muted"
                            value={seed}
                            onChange={(e) => setSeed(Number(e.target.value))}
                            title="Seed"
                            placeholder="-1"
                        />
                        {isImg2Img && (
                            <>
                                <label className="text-sm">Denoise</label>
                                <input
                                    type="number"
                                    step="0.05"
                                    className="w-24 p-1 rounded bg-surface-muted"
                                    value={denoise}
                                    onChange={(e) => setDenoise(Number(e.target.value))}
                                    title="Denoising strength"
                                    placeholder="0.6"
                                />
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="px-4 py-2 rounded bg-primary text-background disabled:opacity-50"
                        >
                            {isLoading ? 'Генерация…' : isImg2Img ? 'Img2Img' : 'Txt2Img'}
                        </button>
                        {error && <span className="text-warning text-sm">{error}</span>}
                    </div>
                </div>
                <div className="col-span-1 flex flex-col gap-3">
                    <label className="text-sm">Automatic1111 URL</label>
                    <input
                        className="w-full p-2 rounded bg-surface-muted"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        title="Automatic1111 URL"
                        placeholder="http://127.0.0.1:7860"
                    />
                    <div className="text-xs text-muted">
                        Убедитесь, что A1111 запущен с параметрами: --api --cors-allow-origins *
                    </div>
                </div>
            </div>

            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                        <div key={idx} className="rounded overflow-hidden bg-surface-muted p-2">
                            <img
                                alt={`gen-${idx}`}
                                className="w-full h-auto rounded"
                                src={`data:image/png;base64,${img}`}
                            />
                            <a
                                className="text-xs underline mt-2 inline-block"
                                href={`data:image/png;base64,${img}`}
                                download={`photo-studio-${Date.now()}-${idx}.png`}
                            >
                                Скачать
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PhotoStudioPanel;
