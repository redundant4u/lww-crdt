import { RGB } from "@utils/PixelData";
import { PixelEditor } from "@utils/PixelEditor";
import { useEffect, useRef } from "react";

const CRDT = () => {
    const acanvasRef = useRef<HTMLCanvasElement>(null);
    const bcanvasRef = useRef<HTMLCanvasElement>(null);
    const paletteRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!acanvasRef.current || !bcanvasRef.current || !paletteRef.current) {
            return;
        }

        const acanvas = acanvasRef.current;
        const bcanvas = bcanvasRef.current;
        const palette = paletteRef.current;

        const artboardSize = { w: 100, h: 100 };
        const alice = new PixelEditor(acanvas, artboardSize);
        const bob = new PixelEditor(bcanvas, artboardSize);

        alice.onchange = (state) => bob.receive(state);
        bob.onchange = (state) => alice.receive(state);

        palette.oninput = () => {
            const hex = palette.value.substring(1).match(/[\da-f]{2}/g) || [];
            const rgb = hex.map((byte) => parseInt(byte, 16));

            if (rgb.length === 3) {
                alice.color = bob.color = rgb as RGB;
            }
        };

        return () => {
            alice.onchange = () => null;
            bob.onchange = () => null;
            palette.oninput = null;
        };
    }, []);

    return (
        <>
            <div className="wrapper">
                <div className="canvases">
                    <canvas ref={acanvasRef} className="canvas" id="alice"></canvas>
                    <canvas ref={bcanvasRef} className="canvas" id="bob"></canvas>
                </div>
                <input ref={paletteRef} className="color" type="color" defaultValue="#000000" />
            </div>
            <style jsx>{`
                .wrapper {
                    display: inline-flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .canvases {
                    display: flex;
                    gap: 1rem;
                }

                .canvas {
                    width: 25rem;
                    height: 25rem;
                    border: 0.25rem solid #eeeeee;
                    border-radius: 0.25rem;
                    cursor: crosshair;
                    touch-action: none;
                }

                .color {
                    border: 0;
                }
            `}</style>
        </>
    );
};

export default CRDT;
