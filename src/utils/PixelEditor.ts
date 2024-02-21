import { PixelData, RGB } from "./PixelData";

type ArtBoard = { w: number; h: number };

export class PixelEditor {
    /** The underlying <canvas> element */
    private _el: HTMLCanvasElement;

    /** The 2D canvas rendering context */
    private _ctx: CanvasRenderingContext2D;

    /** The artboard size, in drawable pxiels */
    private _artboard: ArtBoard;

    /** The underlying pixel data */
    private _data = new PixelData("test");

    /** The selected color */
    private _color: RGB = [0, 0, 0];

    private _painted = new Set<string>();

    /** The previous position of the mouse cursor */
    private _prev: [x: number, y: number] | undefined;

    /** Listeners for change events */
    private _listeners: Array<(state: PixelData["state"]) => void> = [];

    constructor(el: HTMLCanvasElement, artboard: ArtBoard) {
        this._el = el;

        // get the 2D rendering context
        const ctx = el.getContext("2d");

        if (!ctx) {
            throw new Error("Couldn't get rendering context");
        }
        this._ctx = ctx;

        // store the artboard size
        this._artboard = artboard;

        // listen for pointer events
        this._el.addEventListener("pointerdown", this);
        this._el.addEventListener("pointermove", this);
        this._el.addEventListener("pointerup", this);

        // resize the canvas
        this._el.width = this._el.clientWidth * devicePixelRatio;
        this._el.height = this._el.clientHeight * devicePixelRatio;
        this._ctx.scale(devicePixelRatio, devicePixelRatio);
        this._ctx.imageSmoothingEnabled = false;
    }

    /**
     * Appends a listener to be called when the state changes.
     * @param listener */
    set onchange(listener: (state: PixelData["state"]) => void) {
        this._listeners.push(listener);
    }

    /** Sets the drawing color. */
    set color(color: RGB) {
        this._color = color;
    }

    /**
     * Handles events on the canvas.
     * @param e Pointer event from the canvas element.
     */
    handleEvent(e: PointerEvent) {
        switch (e.type) {
            case "pointerdown": {
                this._el.setPointerCapture(e.pointerId);
                // fallthrough
            }
            case "pointermove": {
                if (!this._el.hasPointerCapture(e.pointerId)) return;

                // convert canvas pixels to artboard pixels
                const x = Math.floor((this._artboard.w * e.offsetX) / this._el.clientWidth),
                    y = Math.floor((this._artboard.h * e.offsetY) / this._el.clientHeight);

                this.paint(x, y);

                this._prev = [x, y];
                break;
            }
            case "pointerup": {
                this._el.releasePointerCapture(e.pointerId);
                this._prev = undefined;
                this._painted.clear();
                break;
            }
        }
    }

    /**
     * Sets pixel under the mouse cursor with the current color.
     * @param x X coordinate of the destination pixel.
     * @param y Y coordinate of the destination pixel.
     */
    private paint(x: number, y: number) {
        if (x < 0 || this._artboard.w <= x) {
            return;
        }
        if (y < 0 || this._artboard.h <= y) {
            return;
        }

        if (!this.checkPainted(x, y)) {
            this._data.set(x, y, this._color);
        }

        let [x0, y0] = this._prev || [x, y];

        const dx = x - x0,
            dy = y - y0;

        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        const xinc = dx / steps,
            yinc = dy / steps;

        for (let i = 0; i < steps; i++) {
            x0 += xinc;
            y0 += yinc;

            const x1 = Math.round(x0);
            const y1 = Math.round(y0);

            if (!this.checkPainted(x1, y1)) {
                this._data.set(x1, y1, this._color);
            }
        }

        this.draw();
        this.notify();
    }

    /** Draws each pixel on the canvas. */
    private async draw() {
        /** Number of channels per pixel; R, G, B, A */
        const chans = 4;

        /** A buffer to hold the raw pixel data.
         * Each pixel corresponds to four bytes in the buffer,
         * so the full size is the number of pixels times the number of channels per pixel. */
        const buffer = new Uint8ClampedArray(this._artboard.w * this._artboard.h * chans);

        /** The number of bytes in the buffer representing a single artboard row. */
        const rowsize = this._artboard.w * chans;

        for (let row = 0; row < this._artboard.h; row++) {
            // calculate the byte offset of the start of the row relative to the start of the buffer
            const offsetY = row * rowsize;

            for (let col = 0; col < this._artboard.w; col++) {
                // calculate the byte offset of the pixel relative to the start of the row
                const offsetX = col * chans;

                // calculate the byte offset of the pixel relative to the start of the buffer
                const offset = offsetY + offsetX;

                const [r, g, b] = this._data.get(col, row);
                buffer[offset] = r;
                buffer[offset + 1] = g;
                buffer[offset + 2] = b;
                buffer[offset + 3] = 255;
            }
        }

        const data = new ImageData(buffer, this._artboard.w, this._artboard.h);
        const bitmap = await createImageBitmap(data);
        this._ctx.drawImage(bitmap, 0, 0, this._el.clientWidth, this._el.clientHeight);
    }

    /** Notify all listeners that the state has changed. */
    private notify() {
        const state = this._data.state;
        for (const listener of this._listeners) {
            listener(state);
        }
    }

    /**
     * Check whether a pixel has been painted during the current drag operation
     * @param x X coordinate of the target pixel.
     * @param y Y coordinate of the target pixel.
     */
    private checkPainted(x: number, y: number) {
        const key = PixelData.key(x, y);

        const painted = this._painted.has(key);
        this._painted.add(key);

        return painted;
    }

    /**
     * Merge remote state with the current state and redraw the canvas.
     * @param state State to merge into the current state. */
    receive(state: PixelData["state"]) {
        this._data.merge(state);
        this.draw();
    }
}
