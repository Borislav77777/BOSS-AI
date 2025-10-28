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
    init_images: string[];
    denoising_strength?: number;
};
export type A1111Image = {
    images: string[];
    parameters?: unknown;
    info?: string;
};
export declare function generateTxt2Img(params: Txt2ImgParams): Promise<A1111Image>;
export declare function generateImg2Img(params: Img2ImgParams): Promise<A1111Image>;
export declare function fileToBase64(file: File): Promise<string>;
//# sourceMappingURL=photo-studio-api.d.ts.map