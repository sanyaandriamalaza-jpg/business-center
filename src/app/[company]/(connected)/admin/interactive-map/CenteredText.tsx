import { Text as KonvaText } from "react-konva";
import Konva from "konva";
import { useRef, useEffect, useState } from "react";

interface CenteredTextProps {
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  width: number;
}

const CenteredText: React.FC<CenteredTextProps> = ({
  x,
  y,
  text,
  fontSize = 16,
  width,
}) => {
  const textRef = useRef<Konva.Text>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (textRef.current) {
      setOffset({
        x: textRef.current.width() / 2,
        y: textRef.current.height() / 2,
      });
    }
  }, [text, width, fontSize]);

  return (
    <KonvaText
      ref={textRef}
      x={x}
      y={y}
      text={text}
      fontSize={fontSize}
      fill="black"
      width={width}
      align="center"
      wrap="word"
      offsetX={offset.x}
      offsetY={offset.y}
      listening={true}
    />
  );
};

export default CenteredText;
