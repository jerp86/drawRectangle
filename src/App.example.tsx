import { useRef, useState, useEffect, MouseEvent, ChangeEvent } from "react";

import "./App.css";
import { base64 } from "./base";
import { getBase64StringFromDataUrl, toDataURL } from "./utils";

interface InfoProps {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface StyleProps {
  backgroundColor?: string;
}

interface RectProps {
  deleteMeta?: InfoProps;
  meta: { name: string };
  pos: InfoProps;
  style?: StyleProps;
}

interface CollidesProps {
  rects: RectProps[];
  x: number;
  y: number;
}

function App() {
  const canvas = useRef<HTMLCanvasElement>(null);
  let context: CanvasRenderingContext2D | null;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let mouseDown = false;
  let mouseX = 0;
  let mouseY = 0;

  const [image, setImage] = useState("");
  const [deleteImage, setDeleteImage] = useState("");
  const [rectArr, setRectArr] = useState<RectProps[]>([]);
  const [editable, setEditable] = useState(false);
  const [shouldAddRect, setShouldAddRect] = useState(false);
  const [posMeta, setPosMeta] = useState<InfoProps>({} as InfoProps);
  const [name, setName] = useState("");
  const [color, setColor] = useState("");

  const collides = ({ rects, x, y }: CollidesProps): RectProps => {
    let isCollision = {} as RectProps;
    for (let i = 0; i < rects.length; i++) {
      const {
        h = 0,
        w = 0,
        x: left = 0,
        y: top = 0,
      } = rects[i].deleteMeta || ({} as InfoProps);
      const right = left + w;
      const bottom = top + h;
      if (right >= x && left <= x && bottom >= y && top <= y) {
        isCollision = rects[i];
      }
    }

    return isCollision;
  };

  // desenha retângulo com fundo
  const drawFillRect = ({ deleteMeta, pos, style }: RectProps) => {
    if (!context?.beginPath) return;

    const { x, y, w, h } = pos;
    const { backgroundColor = "black" } = style || ({} as StyleProps);

    context.beginPath();
    context.fillStyle = backgroundColor;
    context.clearRect(x, y, w, h);
    context.fillRect(x, y, w, h);

    if (deleteImage && deleteMeta && deleteMeta?.x && deleteMeta?.y) {
      const img = new Image(deleteMeta.w, deleteMeta.h);
      img.src = deleteImage;
      console.log("deleteImage", deleteImage);
      img.onload = () => context?.drawImage(img, deleteMeta.x, deleteMeta.y);
    }
  };

  const drawAvailRects = () => {
    for (const rectItem of rectArr) {
      drawFillRect(rectItem);
    }
  };

  const clearRect = () => {
    if (!canvas.current || !context) return;

    context.clearRect(0, 0, canvas.current.width, canvas.current.height);
  };

  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!editable || !canvas.current) return;

    lastMouseX = parseInt(String(event.clientX - canvas.current.offsetLeft));
    lastMouseY = parseInt(String(event.clientY - canvas.current.offsetTop));
    mouseDown = true;

    console.log("handleMouseDown", lastMouseX, lastMouseY);
  };

  const handleMouseUp = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!editable || !canvas.current) return;

    mouseX = parseInt(String(event.clientX - canvas.current.offsetLeft));
    mouseY = parseInt(String(event.clientY - canvas.current.offsetTop));
    setShouldAddRect(true);

    const width = mouseX - lastMouseX;
    const height = mouseY - lastMouseY;
    drawFillRect({
      pos: { x: lastMouseX, y: lastMouseY, w: width, h: height },
      style: { backgroundColor: "rgb(200, 50, 35, 0.1)" },
      meta: { name: "untitled" },
    });

    setPosMeta({
      x: lastMouseX,
      y: lastMouseY,
      w: width,
      h: height,
    });

    mouseDown = false;
  };

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!editable || !canvas.current || !mouseDown) return;

    mouseX = parseInt(String(event.clientX - canvas.current?.offsetLeft));
    mouseY = parseInt(String(event.clientY - canvas.current?.offsetTop));
    const width = mouseX - lastMouseX;
    const height = mouseY - lastMouseY;

    clearRect();
    drawAvailRects();
    drawFillRect({
      pos: { x: lastMouseX, y: lastMouseY, w: width, h: height },
      style: { backgroundColor: "rgb(200, 50, 30, 0.1)" },
      meta: { name: "untitled" },
    });
  };

  const addRect = () => {
    const newRect: RectProps = {
      pos: posMeta,
      style: { backgroundColor: color },
      meta: { name },
      deleteMeta: {
        x: posMeta.x + (posMeta.w - 26),
        y: posMeta.y + (posMeta.h - 26),
        w: 20,
        h: 20,
      },
    };
    setRectArr((prev) => [...prev, newRect]);
    setShouldAddRect(false);
  };

  const handleAddRect = () => addRect();

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    if (!FileReader && !event.target.files.length) return;

    const fileReader = new FileReader();
    fileReader.onload = () => {
      const background = new Image();
      background.src = String(fileReader.result);

      setImage(background.src);
      setEditable(true);
      // Certifique-se de que a imagem seja carregada primeiro, caso contrário, nada será desenhado.
      // const file = getBase64StringFromDataUrl(background.src);
      // console.log(file);

      // const dataUrl = canvas.current?.toDataURL("image/jpeg");
      // console.log(dataUrl);
      // console.log(background.src);
      // const file = getBase64StringFromDataUrl(dataUrl);
      // console.log("file", file);
      // if (file) setImage(file);

      const img = document.createElement("img");
      img.src = background.src;
      const div = document.querySelector("div.App");
      console.log(div);
      div?.appendChild(img);
    };

    fileReader.readAsDataURL(event.target.files[0]);
  };

  const handleDeleteFiles = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    if (!FileReader || !event.target.files.length) return;

    const fileReader = new FileReader();
    fileReader.onload = () => {
      const background = new Image();
      background.src = String(fileReader.result);
      setDeleteImage(background.src);
      setEditable(true);
    };

    fileReader.readAsDataURL(event.target.files[0]);
  };

  // inicializando o contexto do convas
  useEffect(() => {
    if (!canvas.current) return;

    // atribua dinamicamente a largura e a altura à tela
    const canvasElement = canvas.current;
    canvasElement.width = canvasElement.clientWidth;
    canvasElement.height = canvasElement.clientHeight;

    // obter contexto da tela
    context = canvasElement.getContext("2d");
  }, []);

  useEffect(() => {
    drawAvailRects();
    const handler = (e: any) => {
      const rect = collides({ rects: rectArr, x: e?.clientX, y: e?.clientY });
      if (rect) {
        console.log(`collision: ${rect?.pos?.x}/${rect?.pos?.y}`);
        clearRect();
        const newArr = rectArr.filter(
          ({ pos }) => pos.x !== rect.pos.x && pos.y !== rect.pos.y
        );
        setRectArr(newArr);
      } else {
        console.log("no collision");
      }
    };

    canvas.current?.addEventListener("click", handler, false);

    return () => canvas.current?.removeEventListener("click", handler);
  }, [rectArr]);

  return (
    <div className="App" style={{ position: "relative" }}>
      <div style={{ display: "flex" }}>
        <div
          style={{
            position: "absolute",
            maxWidth: "80vw",
            top: 0,
            left: 0,
            maxHeight: "90vh",
            width: "100%",
            height: "100%",
            backgroundImage: `url(${image})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            zIndex: "-1",
          }}
        />
        <canvas
          ref={canvas}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{
            width: "80vw",
            height: "90vh",
            backgroundColor: "transparent",
          }}
        ></canvas>
        <div>
          {rectArr.map((item, index) => (
            <div key={String(index)}>
              <div>{item.meta.name}</div>
              <div
                onClick={() => {
                  clearRect();
                  const newArray = rectArr.filter((_, idx) => idx !== index);
                  setRectArr(newArray);
                }}
              >
                delete
              </div>
            </div>
          ))}
          <div hidden={!shouldAddRect}>
            <input
              type="text"
              placeholder="add name"
              value={name}
              onChange={(evt) => setName(evt.target.value)}
            />
            <input
              type="text"
              placeholder="add color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            <button type="button" onClick={handleAddRect}>
              Add React
            </button>
          </div>
        </div>
      </div>

      <input type="file" onChange={handleFiles} />
      {/* <input type="file" onChange={handleDeleteFiles} /> */}
    </div>
  );
}

export default App;
