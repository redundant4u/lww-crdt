import { useEffect, useRef } from "react";
import { Socket, io } from "socket.io-client";

import { RGB } from "@utils/PixelData";
import { PixelEditor } from "@utils/PixelEditor";

type Props = {
    isBob: boolean;
};

const CRDT = ({ isBob }: Props) => {
    const socket: Socket = io(process.env.SOCKET_URL ?? "http://localhost:3000", {
        transports: ["websocket"],
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const paletteRef = useRef<HTMLInputElement>(null);

    const clearCanvas = () => socket.emit("clear");

    useEffect(() => {
        if (!canvasRef.current || !paletteRef.current) {
            return;
        }

        const canvas = canvasRef.current;
        const palette = paletteRef.current;

        const name = isBob ? "bob" : "alice";
        const artboardSize = { w: 100, h: 100 };

        const editor = new PixelEditor(canvas, artboardSize, name);

        editor.onchange = (state) => {
            socket.emit(name, state);
        };

        palette.oninput = () => {
            const hex = palette.value.substring(1).match(/[\da-f]{2}/g) || [];
            const rgb = hex.map((byte) => parseInt(byte, 16));

            if (rgb.length === 3) {
                editor.color = rgb as RGB;
            }
        };

        socket.once("init", (state) => {
            editor.receive(state);
        });

        socket.on(name, (state) => {
            editor.receive(state);
        });

        socket.on("clear", () => {
            editor.clear();
        });

        return () => {
            editor.onchange = () => null;
            palette.oninput = null;

            socket.disconnect();
            socket.close();
        };
    }, []);

    return (
        <>
            <div className="wrapper">
                <div className="canvases">
                    <canvas ref={canvasRef} className="canvas"></canvas>
                </div>
                <div>
                    <input ref={paletteRef} className="color" type="color" defaultValue="#000000" />
                    <svg
                        className="with-icon_icon__MHUeb"
                        data-testid="geist-icon"
                        fill="none"
                        height="24"
                        shapeRendering={"geometricPrecision"}
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        width="24"
                        onClick={clearCanvas}
                    >
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                </div>
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
