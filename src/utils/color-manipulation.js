/* eslint no-undef: 0 */ 

/**
 * Color manipulation functions below are adapted from
 * https://github.com/d3/d3-color.
 */

let t1 = 6 / 29;

export let constants = {
    Xn: 0.950470,
    Yn: 1,
    Zn: 1.088830,
    t0: 4 / 29,
    t1,
    t2: 3 * t1 * t1,
    t3: t1 * t1 * t1,
    twoPi: 2 * Math.PI,
};

/**
 * Convert an RGB pixel into an HCL pixel.
 * @param {Array<number>} pixel A pixel in RGB space.
 * @return {Array<number>} A pixel in HCL space.
 */
function rgb2hcl(pixel) {
    let red = rgb2xyz(pixel[0]);
    let green = rgb2xyz(pixel[1]);
    let blue = rgb2xyz(pixel[2]);

    let x = xyz2lab((0.4124564 * red + 0.3575761 * green + 0.1804375 * blue) / Xn);
    let y = xyz2lab((0.2126729 * red + 0.7151522 * green + 0.0721750 * blue) / Yn);
    let z = xyz2lab((0.0193339 * red + 0.1191920 * green + 0.9503041 * blue) / Zn);

    let l = 116 * y - 16;
    let a = 500 * (x - y);
    let b = 200 * (y - z);

    let c = Math.sqrt(a * a + b * b);
    let h = Math.atan2(b, a);
    if (h < 0) {
        h += twoPi;
    }

    pixel[0] = h;
    pixel[1] = c;
    pixel[2] = l;

    return pixel;
}

/**
 * Convert an HCL pixel into an RGB pixel.
 * @param {Array<number>} pixel A pixel in HCL space.
 * @return {Array<number>} A pixel in RGB space.
 */
function hcl2rgb(pixel) {
    let h = pixel[0];
    let c = pixel[1];
    let l = pixel[2];

    let a = Math.cos(h) * c;
    let b = Math.sin(h) * c;

    let y = (l + 16) / 116;
    let x = isNaN(a) ? y : y + a / 500;
    let z = isNaN(b) ? y : y - b / 200;

    y = Yn * lab2xyz(y);
    x = Xn * lab2xyz(x);
    z = Zn * lab2xyz(z);

    pixel[0] = xyz2rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);
    pixel[1] = xyz2rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z);
    pixel[2] = xyz2rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);

    return pixel;
}

function xyz2lab(t) {
    return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
}

function lab2xyz(t) {
    return t > t1 ? t * t * t : t2 * (t - t0);
}

function rgb2xyz(x) {
    return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function xyz2rgb(x) {
    return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
}

export let utilFunctions = {
    rgb2hcl,
    hcl2rgb,
    rgb2xyz,
    lab2xyz,
    xyz2lab,
    xyz2rgb,
};

export function operation(pixels) {
    let hcl = rgb2hcl(pixels[0]);

    let h = hcl[0] + Math.PI * (hue) / 180;
    if(h < 0) {
        h += twoPi;
    } 
    else if(h > twoPi) {
        h -= twoPi;
    }
    hcl[0] = h;

    hcl[1] *= (chroma / 100);
    hcl[2] *= (lightness / 100);

    return hcl2rgb(hcl);
}