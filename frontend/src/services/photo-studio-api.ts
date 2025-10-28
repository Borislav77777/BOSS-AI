/**
 * Photo Studio API client for Automatic1111
 */
export type Txt2ImgParams = {
  baseUrl: string;
  prompt: string;
  negative_prompt?: string;
  steps?: number;
  sampler_name?: string;
  cfg_scale?: number;
  width?: number;
  height?: number;
  seed?: number;
  batch_size?: number;
  n_iter?: number;
};

export type Img2ImgParams = Txt2ImgParams & {
  init_images: string[]; // base64 without data URI prefix
  denoising_strength?: number;
};

export type A1111Image = {
  images: string[]; // base64 strings (PNG)
  parameters?: unknown;
  info?: string;
};

export async function generateTxt2Img(params: Txt2ImgParams): Promise<A1111Image> {
  const {
    baseUrl,
    prompt,
    negative_prompt = '',
    steps = 28,
    sampler_name = 'Euler a',
    cfg_scale = 7,
    width = 512,
    height = 512,
    seed = -1,
    batch_size = 1,
    n_iter = 1
  } = params;

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
  return (await res.json()) as A1111Image;
}

export async function generateImg2Img(params: Img2ImgParams): Promise<A1111Image> {
  const {
    baseUrl,
    prompt,
    negative_prompt = '',
    steps = 28,
    sampler_name = 'Euler a',
    cfg_scale = 7,
    width = 512,
    height = 512,
    seed = -1,
    batch_size = 1,
    n_iter = 1,
    init_images,
    denoising_strength = 0.6
  } = params;

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
  return (await res.json()) as A1111Image;
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.replace(/^data:[^,]+,/, '');
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
