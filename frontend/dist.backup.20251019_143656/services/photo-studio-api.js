export async function generateTxt2Img(params) {
    const { baseUrl, prompt, negative_prompt = '', steps = 28, sampler_name = 'Euler a', cfg_scale = 7, width = 512, height = 512, seed = -1, batch_size = 1, n_iter = 1 } = params;
    const body = {
        prompt,
        negative_prompt,
        steps,
        sampler_name,
        cfg_scale,
        width,
        height,
        seed,
        batch_size,
        n_iter
    };
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/sdapi/v1/txt2img`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        throw new Error(`txt2img failed: HTTP ${res.status}`);
    }
    return (await res.json());
}
export async function generateImg2Img(params) {
    const { baseUrl, prompt, negative_prompt = '', steps = 28, sampler_name = 'Euler a', cfg_scale = 7, width = 512, height = 512, seed = -1, batch_size = 1, n_iter = 1, init_images, denoising_strength = 0.6 } = params;
    const body = {
        prompt,
        negative_prompt,
        steps,
        sampler_name,
        cfg_scale,
        width,
        height,
        seed,
        batch_size,
        n_iter,
        init_images,
        denoising_strength
    };
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/sdapi/v1/img2img`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        throw new Error(`img2img failed: HTTP ${res.status}`);
    }
    return (await res.json());
}
export async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            const base64 = result.replace(/^data:[^,]+,/, '');
            resolve(base64);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}
//# sourceMappingURL=photo-studio-api.js.map