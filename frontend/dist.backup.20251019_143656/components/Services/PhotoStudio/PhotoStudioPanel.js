import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { fileToBase64, generateImg2Img, generateTxt2Img } from '@/services/photo-studio-api';
import React, { useMemo, useState } from 'react';
export const PhotoStudioPanel = ({ defaults = {} }) => {
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [baseUrl, setBaseUrl] = useState(defaults.baseUrl || 'http://127.0.0.1:7860');
    const [steps, setSteps] = useState(defaults.steps ?? 28);
    const [sampler, setSampler] = useState(defaults.sampler || 'Euler a');
    const [cfgScale, setCfgScale] = useState(defaults.cfgScale ?? 7);
    const [width, setWidth] = useState(defaults.width ?? 512);
    const [height, setHeight] = useState(defaults.height ?? 512);
    const [seed, setSeed] = useState(-1);
    const [denoise, setDenoise] = useState(0.6);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [images, setImages] = useState([]);
    const isImg2Img = useMemo(() => !!file, [file]);
    const onFileChange = (e) => {
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
            }
            else {
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
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Ошибка генерации');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "h-full w-full p-4 flex flex-col gap-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "col-span-2 flex flex-col gap-3", children: [_jsx("textarea", { value: prompt, onChange: (e) => setPrompt(e.target.value), placeholder: "\u041F\u0440\u043E\u043C\u043F\u0442", className: "w-full p-2 rounded bg-surface text-white min-h-[100px]" }), _jsx("textarea", { value: negativePrompt, onChange: (e) => setNegativePrompt(e.target.value), placeholder: "\u041D\u0435\u0433\u0430\u0442\u0438\u0432\u043D\u044B\u0439 \u043F\u0440\u043E\u043C\u043F\u0442 (optional)", className: "w-full p-2 rounded bg-surface text-white min-h-[60px]" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "file", accept: "image/*", onChange: onFileChange, title: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0444\u043E\u0442\u043E" }), file && _jsx("span", { className: "text-xs text-muted", children: file.name })] }), _jsxs("div", { className: "flex flex-wrap gap-3 items-center", children: [_jsx("label", { className: "text-sm", children: "Sampler" }), _jsx("input", { className: "w-40 p-1 rounded bg-surface-muted", value: sampler, onChange: (e) => setSampler(e.target.value), title: "Sampler", placeholder: "Euler a" }), _jsx("label", { className: "text-sm", children: "Steps" }), _jsx("input", { type: "number", className: "w-24 p-1 rounded bg-surface-muted", value: steps, onChange: (e) => setSteps(Number(e.target.value)), title: "Steps", placeholder: "28" }), _jsx("label", { className: "text-sm", children: "CFG" }), _jsx("input", { type: "number", className: "w-24 p-1 rounded bg-surface-muted", value: cfgScale, onChange: (e) => setCfgScale(Number(e.target.value)), title: "CFG Scale", placeholder: "7" }), _jsx("label", { className: "text-sm", children: "W" }), _jsx("input", { type: "number", className: "w-24 p-1 rounded bg-surface-muted", value: width, onChange: (e) => setWidth(Number(e.target.value)), title: "Width", placeholder: "512" }), _jsx("label", { className: "text-sm", children: "H" }), _jsx("input", { type: "number", className: "w-24 p-1 rounded bg-surface-muted", value: height, onChange: (e) => setHeight(Number(e.target.value)), title: "Height", placeholder: "512" }), _jsx("label", { className: "text-sm", children: "Seed" }), _jsx("input", { type: "number", className: "w-32 p-1 rounded bg-surface-muted", value: seed, onChange: (e) => setSeed(Number(e.target.value)), title: "Seed", placeholder: "-1" }), isImg2Img && (_jsxs(_Fragment, { children: [_jsx("label", { className: "text-sm", children: "Denoise" }), _jsx("input", { type: "number", step: "0.05", className: "w-24 p-1 rounded bg-surface-muted", value: denoise, onChange: (e) => setDenoise(Number(e.target.value)), title: "Denoising strength", placeholder: "0.6" })] }))] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: handleGenerate, disabled: isLoading, className: "px-4 py-2 rounded bg-primary text-background disabled:opacity-50", children: isLoading ? 'Генерация…' : isImg2Img ? 'Img2Img' : 'Txt2Img' }), error && _jsx("span", { className: "text-warning text-sm", children: error })] })] }), _jsxs("div", { className: "col-span-1 flex flex-col gap-3", children: [_jsx("label", { className: "text-sm", children: "Automatic1111 URL" }), _jsx("input", { className: "w-full p-2 rounded bg-surface-muted", value: baseUrl, onChange: (e) => setBaseUrl(e.target.value), title: "Automatic1111 URL", placeholder: "http://127.0.0.1:7860" }), _jsx("div", { className: "text-xs text-muted", children: "\u0423\u0431\u0435\u0434\u0438\u0442\u0435\u0441\u044C, \u0447\u0442\u043E A1111 \u0437\u0430\u043F\u0443\u0449\u0435\u043D \u0441 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0430\u043C\u0438: --api --cors-allow-origins *" })] })] }), images.length > 0 && (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: images.map((img, idx) => (_jsxs("div", { className: "rounded overflow-hidden bg-surface-muted p-2", children: [_jsx("img", { alt: `gen-${idx}`, className: "w-full h-auto rounded", src: `data:image/png;base64,${img}` }), _jsx("a", { className: "text-xs underline mt-2 inline-block", href: `data:image/png;base64,${img}`, download: `photo-studio-${Date.now()}-${idx}.png`, children: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C" })] }, idx))) }))] }));
};
export default PhotoStudioPanel;
//# sourceMappingURL=PhotoStudioPanel.js.map