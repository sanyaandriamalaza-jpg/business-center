"use client";

import { Button } from "@/src/components/ui/button";
import {
  MousePointer2,
  MoveRight,
  RectangleHorizontal,
  Circle as LucideCircle,
  Triangle as LucideTriangle,
  PenLine,
  LandPlot,
  Type,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { RgbaColorPicker } from "react-colorful";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  RegularPolygon,
  Arrow,
  Line,
  Transformer,
  Text,
  Group,
  Image as KonvaImage,
} from "react-konva";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Label } from "@/src/components/ui/label";
import {
  FormType,
  ImageOnStage,
  Office,
  PngItem,
  RGBAColor,
  Shape,
  ShapeType,
} from "@/src/lib/type";
import CenteredText from "./CenteredText";
import { Input } from "@/src/components/ui/input";
import { useAdminStore } from "@/src/store/useAdminStore";
import { useToast } from "@/src/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/src/components/ui/resizable";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import React from "react";
import { KonvaEventObject } from "konva/lib/Node";

const pngList: PngItem[] = [
  { src: "/images/biblio/fauteuil.png", id: "fauteuil" },
  { src: "/images/biblio/canape.png", id: "canape" },
  { src: "/images/biblio/canape-2.png", id: "canape-2" },
  { src: "/images/biblio/canape-3.png", id: "canape-3" },
  { src: "/images/biblio/evier.png", id: "evier" },
  { src: "/images/biblio/fleur.png", id: "fleur" },
  { src: "/images/biblio/toilette.png", id: "toilette" },
];

const GRID_SIZE = 20;

const buttonList: { id: FormType; content: React.ReactNode }[] = [
  { id: "pointer", content: <MousePointer2 /> },
  { id: "rectangle", content: <RectangleHorizontal /> },
  { id: "circle", content: <LucideCircle /> },
  { id: "triangle", content: <LucideTriangle /> },
  { id: "arrow", content: <MoveRight /> },
  { id: "polyline", content: <PenLine /> },
  { id: "polygon", content: <LandPlot /> },
  { id: "text", content: <Type /> },
];

// Fonction pour snapper une valeur à la grille
function snapToGrid(value: number) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

export default function KonvaCreator({
  officeList,
  reloadData,
}: {
  officeList?: Office[] | null;
  reloadData?: () => void;
}) {
  const [isTextEditorVisible, setIsTextEditorVisible] =
    useState<boolean>(false);
  const [textEditorValue, setTextEditorValue] = useState<string>();
  const [textShapeToEdit, setTextShapeToEdit] = useState<Shape>();

  const [activeButton, setActiveButton] = useState<FormType>("pointer");
  const [color, setColor] = useState<RGBAColor>({
    r: 145,
    g: 203,
    b: 242,
    a: 1,
  });
  const [stageSize, setStageSize] = useState({ width: 300, height: 300 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const currentShapeId = useRef<string | null>(null);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [shapes, setShapes] = useState<Shape[]>([]);
  const [isPainting, setIsPainting] = useState<boolean>(false);
  const [polygonPoints, setPolygonPoints] = useState<
    { x: number; y: number }[]
  >([]);
  const [polylinePoints, setPolylinePoints] = useState<number[]>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    targetId: string | null;
  }>({ visible: false, x: 0, y: 0, targetId: null });

  const [dialogOfficeOpen, setDialogOfficeOpen] = useState<boolean>(false);
  const [shapeIdToAssignOffice, setShapeIdToAssignOffice] = useState<string>();
  const spacesList = [
    { id: "wc", label: "WC" },
    { id: "toilette", label: "Toilette" },
    { id: "cuisine", label: "Cuisine" },
    { id: "salle-attente", label: "Salle d'attente" },
    { id: "lounge", label: "Espace détente" },
    { id: "cafe", label: "Espace café" },
    { id: "terrasse", label: "Terrasse / rooftop" },
    { id: "zone-impression", label: "Zone imprimante / scanner" },
    { id: "salle-sieste", label: "Salle de sieste" },
    { id: "jardin", label: "Jardin / espace vert" },
    { id: "parking", label: "Parking" },
    ...(officeList && Array.isArray(officeList)
      ? [
          {
            id: "bureau",
            label:
              "Bureau / espace que vous avez créé dans votre espace admin (et n‘est pas encore associé à un plan)",
          },
        ]
      : []),
  ];
  const [selectedSpace, setSelectedSpace] = useState<string>("bureau");

  const [selectedOfficeId, setSelectedOfficeId] = useState<string>();

  const [officeToSelect, setOfficeToSelect] = useState<
    Office[] | null | undefined
  >(officeList);
  const [mapName, setMapName] = useState<string>();

  const layerRef = useRef<Konva.Layer>(null);

  const [imagesOnStage, setImagesOnStage] = useState<ImageOnStage[]>([]);
  const [selectedPng, setSelectedPng] = useState<PngItem | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const handleInsertPng = (png: PngItem) => {
    const img = new window.Image();
    img.src = png.src;
    img.onload = () => {
      setImagesOnStage((prev) => [
        ...prev,
        {
          id: png.id + "_" + Date.now(),
          image: img,
          url: png.src,
          x: 100,
          y: 100,
          width: 90,
          height: 90,
        },
      ]);
      setSelectedPng(null);
    };
  };

  // Gestion de la taille du stage
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      const rect = containerRef.current!.getBoundingClientRect();
      setStageSize({ width: rect.width, height: rect.height });
    };

    // appel initial
    updateSize();

    // resize observer → s'adapte quand le panneau est redimensionné
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Gestion clavier : Shift et Enter pour polyline
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftPressed(true);

      if (e.key === "Enter" && activeButton === "polygon") {
        if (polygonPoints.length >= 3) {
          const id = uuidv4();

          const minX = Math.min(...polygonPoints.map((p) => p.x));
          const minY = Math.min(...polygonPoints.map((p) => p.y));

          const relativePoints = polygonPoints.map((p) => ({
            x: p.x - minX,
            y: p.y - minY,
          }));

          const newPolygon: Shape = {
            id,
            type: "polygon",
            points: relativePoints,
            fillColor: { ...color },
            x: minX,
            y: minY,
          };

          setShapes((prev) => [...prev, newPolygon]);
          setPolygonPoints([]);
          setMousePos(null);
          setActiveButton("pointer");
        }
      }
      if (e.key === "Enter" && activeButton === "polyline") {
        if (polylinePoints.length >= 4) {
          const id = uuidv4();
          const newPolyline: Shape = {
            id,
            type: "polyline",
            points: [...polylinePoints],
            strokeColor: { ...color },
            strokeWidth: 4
          };
          setShapes((prev) => [...prev, newPolyline]);
          setPolylinePoints([]);
          setMousePos(null);
          setActiveButton("pointer");
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftPressed(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [polylinePoints, polygonPoints, activeButton, color]);

  // Calcule point avec snapping (et shift pour horizontal/vertical)
  function getSnappedPoint(
    from: { x: number; y: number },
    to: { x: number; y: number }
  ) {
    let dx = snapToGrid(to.x);
    let dy = snapToGrid(to.y);

    if (isShiftPressed) {
      const deltaX = Math.abs(dx - from.x);
      const deltaY = Math.abs(dy - from.y);
      if (deltaX > deltaY) dy = from.y;
      else dx = from.x;
    }
    return { x: dx, y: dy };
  }

  const onPointerDown = () => {
    if (activeButton === "pointer") return;

    const stage = stageRef.current;
    const rawPointer = stage?.getPointerPosition();
    if (!rawPointer) return;

    if (activeButton === "polyline") {
      if (polylinePoints.length >= 2) {
        const lastX = polylinePoints[polylinePoints.length - 2];
        const lastY = polylinePoints[polylinePoints.length - 1];
        const snapped = getSnappedPoint({ x: lastX, y: lastY }, rawPointer);
        setPolylinePoints((prev) => [...prev, snapped.x, snapped.y]);
      } else {
        // Premier point polyline snap
        setPolylinePoints([snapToGrid(rawPointer.x), snapToGrid(rawPointer.y)]);
      }
      return;
    }
    if (activeButton === "polygon") {
      if (polygonPoints.length >= 1) {
        // On récupère le dernier point
        const lastPoint = polygonPoints[polygonPoints.length - 1];

        setPolygonPoints((prev) => [
          ...prev,
          { x: rawPointer.x, y: rawPointer.y },
        ]);
      } else {
        // Premier point du polygon
        const snapped = getSnappedPoint(
          { x: rawPointer.x, y: rawPointer.y },
          rawPointer
        );
        setPolygonPoints([{ x: snapped.x, y: snapped.y }]);
      }
      return;
    }

    if (activeButton === "text") {
      const stage = stageRef.current;
      const pointer = stage?.getPointerPosition();
      if (!pointer) return;

      const id = uuidv4();
      const newText: Shape = {
        id,
        type: "text",
        x: snapToGrid(pointer.x),
        y: snapToGrid(pointer.y),
        text: "Texte", // texte par défaut
        fontSize: 18,
        fillColor: { ...color },
      };
      setShapes((prev) => [...prev, newText]);
      setActiveButton("pointer");
      currentShapeId.current = id;
      return;
    }

    // Autres formes
    // const snappedPointer = {
    //   x: snapToGrid(rawPointer.x),
    //   y: snapToGrid(rawPointer.y),
    // };
    const snappedPointer = {
      x: rawPointer.x,
      y: rawPointer.y,
    };

    const id = uuidv4();
    currentShapeId.current = id;
    startPosRef.current = snappedPointer;
    setIsPainting(true);

    const newShape: Shape = {
      id,
      type: activeButton as Exclude<ShapeType, "polyline" | "polygon" | "text">,
      x: snappedPointer.x,
      y: snappedPointer.y,
      width: 0,
      height: 0,
      fillColor: { ...color },
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      skewX: 0,
      skewY: 0,
    };

    setShapes((prev) => [...prev, newShape]);
  };

  // Mouvement souris
  const onPointerMove = (e: KonvaEventObject<PointerEvent>) => {
    const stage = stageRef.current;
    const rawPointer = stage?.getPointerPosition();
    if (!rawPointer) return;

    if (activeButton === "polyline") {
      // Live preview polyline avec snapping + shift
      if (polylinePoints.length >= 2) {
        const lastX = polylinePoints[polylinePoints.length - 2];
        const lastY = polylinePoints[polylinePoints.length - 1];
        const snapped = getSnappedPoint({ x: lastX, y: lastY }, rawPointer);
        setMousePos(snapped);
      } else {
        setMousePos({
          x: snapToGrid(rawPointer.x),
          y: snapToGrid(rawPointer.y),
        });
      }
      return;
    }
    if (activeButton === "polygon") {
      // Live preview polygon avec snapping + shift
      if (polygonPoints.length >= 1) {
        const lastPoint = polygonPoints[polygonPoints.length - 1];

        const snapped = e.evt.shiftKey
          ? getSnappedPoint(lastPoint, rawPointer)
          : rawPointer;

        setMousePos(snapped);
      } else {
        setMousePos({
          x: snapToGrid(rawPointer.x),
          y: snapToGrid(rawPointer.y),
        });
      }
      return;
    }

    if (!isPainting || !currentShapeId.current) return;

    const { x: startX, y: startY } = startPosRef.current;
    let newWidth = rawPointer.x - startX;
    let newHeight = rawPointer.y - startY;

    // Carré pour rectangle si shift
    if (activeButton === "rectangle" && isShiftPressed) {
      const size = Math.min(Math.abs(newWidth), Math.abs(newHeight));
      newWidth = newWidth < 0 ? -size : size;
      newHeight = newHeight < 0 ? -size : size;
    }

    setShapes((prev) =>
      prev.map((shape) =>
        shape.id === currentShapeId.current &&
        shape.type !== "polyline" &&
        shape.type !== "polygon"
          ? { ...shape, width: newWidth, height: newHeight }
          : shape
      )
    );
  };

  // Relâchement souris
  const onPointerUp = () => {
    if (activeButton !== "polyline" && activeButton !== "polygon") {
      setIsPainting(false);
      if (currentShapeId.current) {
        setShapes((prev) =>
          prev.filter((shape) => {
            if (shape.id !== currentShapeId.current) return true;
            if ("width" in shape && "height" in shape) {
              return Math.abs(shape.width) >= 5 && Math.abs(shape.height) >= 5;
            }
            return true;
          })
        );
      }
      currentShapeId.current = null;
      setActiveButton("pointer");
    }
  };

  // Rendu de chaque forme
  const renderShape = (shape: Shape) => {
    if (shape.type === "polyline") {
      return (
        <Line
          key={shape.id}
          points={shape.points}
          stroke={`rgba(${shape.strokeColor.r}, ${shape.strokeColor.g}, ${shape.strokeColor.b}, ${shape.strokeColor.a})`}
          strokeWidth={4}
          lineCap="round"
          lineJoin="round"
          draggable
          onDragEnd={(e) => {
            const node = e.target;
            const newX = snapToGrid(node.x());
            const newY = snapToGrid(node.y());
            node.x(newX);
            node.y(newY);

            setShapes((prev) =>
              prev.map((s) =>
                s.id === shape.id ? { ...s, x: newX, y: newY } : s
              )
            );
          }}
          onContextMenu={(e) => {
            e.evt.preventDefault();
            e.cancelBubble = true;
            setContextMenu({
              visible: true,
              x: e.evt.clientX,
              y: e.evt.clientY,
              targetId: shape.id,
            });
          }}
        />
      );
    }
    if (shape.type === "polygon") {
      const polygon = (
        <Line
          key={shape.id}
          points={shape.points.flatMap((p) => [p.x, p.y])} // transforme [{x,y},...] en [x1,y1,x2,y2,...]
          closed
          fill={`rgba(${shape.fillColor.r}, ${shape.fillColor.g}, ${shape.fillColor.b}, ${shape.fillColor.a})`}
          lineCap="round"
          lineJoin="round"
          onClick={(e) => handleSelect(e, shape.id)}
          onTap={(e) => handleSelect(e, shape.id)}
          onContextMenu={(e) => {
            e.evt.preventDefault();
            e.cancelBubble = true;
            setContextMenu({
              visible: true,
              x: e.evt.clientX,
              y: e.evt.clientY,
              targetId: shape.id,
            });
          }}
        />
      );

      // Calcul du bounding box du polygone
      const xs = shape.points.map((p) => p.x);
      const ys = shape.points.map((p) => p.y);
      const width = Math.max(...xs) - Math.min(...xs);
      const height = Math.max(...ys) - Math.min(...ys);

      return (
        <Group
          key={shape.id}
          id={shape.id}
          x={shape.x}
          y={shape.y}
          rotation={shape.rotation ?? 0}
          scaleX={shape.scaleX ?? 1}
          scaleY={shape.scaleY ?? 1}
          skewX={shape.skewX ?? 0}
          skewY={shape.skewY ?? 0}
          draggable
          onDragMove={(e) => {
            const node = e.target;
            node.x(node.x());
            node.y(node.y());
          }}
          onDragEnd={(e) => {
            const node = e.target;
            const newX = node.x();
            const newY = node.y();
            node.x(newX);
            node.y(newY);

            setShapes((prev) =>
              prev.map((s) =>
                s.id === shape.id ? { ...s, x: newX, y: newY } : s
              )
            );
          }}
          onContextMenu={handleRightClick}
          onClick={(e) => handleSelect(e, shape.id)}
          onTransformEnd={(e) => {
            handleTransformEnd(e, shape.id);
          }}
        >
          {polygon}
          {shape.spaceAssociated?.label && (
            <CenteredText
              x={width / 2}
              y={height / 2}
              text={shape.spaceAssociated.label}
              fontSize={16}
              width={width}
            />
          )}
        </Group>
      );
    }

    if (shape.type === "text") {
      return (
        <Text
          id={shape.id}
          x={shape.x}
          y={shape.y}
          text={shape.text}
          fontSize={shape.fontSize}
          fill={`rgba(${shape.fillColor.r},${shape.fillColor.g},${shape.fillColor.b},${shape.fillColor.a})`}
          draggable
          onDragEnd={(e) => {
            const node = e.target;
            const newX = node.x();
            const newY = node.y();
            node.x(newX);
            node.y(newY);

            setShapes((prev) =>
              prev.map((s) =>
                s.id === shape.id ? { ...s, x: newX, y: newY } : s
              )
            );
          }}
          onDblClick={() => handleTextDblClick(shape)}
          onContextMenu={(e) => {
            e.evt.preventDefault();
            e.cancelBubble = true;
            setContextMenu({
              visible: true,
              x: e.evt.clientX,
              y: e.evt.clientY,
              targetId: shape.id,
            });
          }}
        />
      );
    }

    const fill = `rgba(${shape.fillColor.r}, ${shape.fillColor.g}, ${shape.fillColor.b}, ${shape.fillColor.a})`;

    if (
      shape.type !== "arrow" &&
      (Math.abs(shape.width) < 5 || Math.abs(shape.height) < 5)
    )
      return null;

    let shapeNode: JSX.Element | null = null;

    switch (shape.type) {
      case "rectangle":
        shapeNode = (
          <Rect
            x={0}
            y={0}
            width={shape.width}
            height={shape.height}
            fill={fill}
            onTransformEnd={(e) => {
              handleTransformEnd(e, shape.id);
            }}
          />
        );
        break;
      case "circle":
        shapeNode = (
          <Circle
            x={shape.width / 2}
            y={shape.height / 2}
            radius={Math.sqrt(shape.width ** 2 + shape.height ** 2) / 2}
            fill={fill}
          />
        );
        break;
      case "triangle":
        shapeNode = (
          <RegularPolygon
            x={shape.width / 2}
            y={shape.height / 2}
            sides={3}
            radius={Math.max(shape.width, shape.height) / 2}
            fill={fill}
          />
        );
        break;
      case "arrow":
        return (
          <Arrow
            key={shape.id}
            points={[
              shape.x,
              shape.y,
              shape.x + shape.width,
              shape.y + shape.height,
            ]}
            pointerLength={10}
            pointerWidth={10}
            fill={fill}
            stroke={fill}
            strokeWidth={2}
            draggable
            onDragEnd={(e) => {
              const node = e.target;
              const dx = e.target.x() - shape.x;
              const dy = e.target.y() - shape.y;

              setShapes((prev) =>
                prev.map((s) =>
                  s.id === shape.id
                    ? { ...s, x: shape.x + dx, y: shape.y + dy }
                    : s
                )
              );
            }}
            onContextMenu={(e) => {
              e.evt.preventDefault();
              e.cancelBubble = true;
              setContextMenu({
                visible: true,
                x: e.evt.clientX,
                y: e.evt.clientY,
                targetId: shape.id,
              });
            }}
            onClick={(e) => handleSelect(e, shape.id)}
            onTap={(e) => handleSelect(e, shape.id)}
          />
        );
    }

    return (
      <Group
        key={shape.id}
        id={shape.id}
        x={shape.x}
        y={shape.y}
        rotation={shape.rotation ?? 0}
        scaleX={shape.scaleX ?? 1}
        scaleY={shape.scaleY ?? 1}
        skewX={shape.skewX ?? 0}
        skewY={shape.skewY ?? 0}
        draggable
        onDragMove={(e) => {
          const node = e.target;
          node.x(node.x());
          node.y(node.y());
        }}
        onDragEnd={(e) => {
          const node = e.target;
          const newX = node.x();
          const newY = node.y();
          node.x(newX);
          node.y(newY);

          setShapes((prev) =>
            prev.map((s) =>
              s.id === shape.id ? { ...s, x: newX, y: newY } : s
            )
          );
        }}
        onContextMenu={handleRightClick}
        onClick={(e) => handleSelect(e, shape.id)}
        onTransformEnd={(e) => {
          handleTransformEnd(e, shape.id);
        }}
      >
        {shapeNode}
        {shape.spaceAssociated?.label && (
          <CenteredText
            x={shape.width / 2}
            y={shape.height / 2}
            text={shape.spaceAssociated.label}
            fontSize={16}
            width={Math.abs(shape.width)}
          />
        )}
      </Group>
    );
  };

  const renderImage = (imgObj: ImageOnStage) => {
    return (
      <Group
        key={imgObj.id}
        id={imgObj.id}
        x={imgObj.x}
        y={imgObj.y}
        rotation={imgObj.rotation ?? 0}
        scaleX={imgObj.scaleX ?? 1}
        scaleY={imgObj.scaleY ?? 1}
        skewX={imgObj.skewX ?? 0}
        skewY={imgObj.skewY ?? 0}
        draggable
        onClick={() => setSelectedImageId(imgObj.id)}
        onTap={() => setSelectedImageId(imgObj.id)}
        onDragMove={(e) => {
          const node = e.target;
          node.x(node.x());
          node.y(node.y());
        }}
        onDragEnd={(e) => {
          const node = e.target;
          const newX = node.x();
          const newY = node.y();
          node.x(newX);
          node.y(newY);

          setImagesOnStage((prev) =>
            prev.map((s) =>
              s.id === imgObj.id ? { ...s, x: newX, y: newY } : s
            )
          );
        }}
        onTransformEnd={(e) => handleImageTransformEnd(e, imgObj.id)}
      >
        <KonvaImage
          image={imgObj.image}
          width={imgObj.width ?? imgObj.image.width}
          height={imgObj.height ?? imgObj.image.height}
        />
      </Group>
    );
  };

  const handleTextDblClick = (shape: Shape) => {
    const stage = stageRef.current;
    if (!stage) return;

    if (shape.type !== "text") return;
    const textNode = stage.findOne(`#${shape.id}`);
    if (!textNode) return;

    setTextEditorValue(shape.text!);
    setTextShapeToEdit(shape);
    setIsTextEditorVisible(true);
  };

  const validateTextEditor = () => {
    if (textShapeToEdit && textEditorValue) {
      setShapes((prev) =>
        prev.map((s) =>
          s.id === textShapeToEdit.id ? { ...s, text: textEditorValue } : s
        )
      );
    }
  };

  const handleSelect = (e: any, id: string) => {
    e.cancelBubble = true;
    setSelectedId(id);
  };

  const handleDeselect = (e: any) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  function handleTransformEnd(e: Konva.KonvaEventObject<any>, id: string) {
    const node = e.target as Konva.Node;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();
    const skewX = (node as any).skewX?.() ?? 0;
    const skewY = (node as any).skewY?.() ?? 0;

    const x = snapToGrid(node.x());
    const y = snapToGrid(node.y());

    setShapes((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;

        if ("width" in s && "height" in s) {
          const width = Math.max(5, Math.round(s.width * scaleX));
          const height = Math.max(5, Math.round(s.height * scaleY));
          return {
            ...s,
            x,
            y,
            width,
            height,
            rotation,
            scaleX: 1,
            scaleY: 1,
            skewX,
            skewY,
          };
        }

        // Pour polyline ou arrow
        return { ...s, x, y, rotation, scaleX, scaleY, skewX, skewY };
      })
    );

    // Reset scale pour éviter effet cumulatif
    node.scaleX(1);
    node.scaleY(1);
  }

  function handleImageTransformEnd(e: Konva.KonvaEventObject<any>, id: string) {
    const node = e.target as Konva.Node;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();
    const skewX = (node as any).skewX?.() ?? 0;
    const skewY = (node as any).skewY?.() ?? 0;

    const x = snapToGrid(node.x());
    const y = snapToGrid(node.y());

    setImagesOnStage((prev) =>
      prev.map((img) => {
        if (img.id !== id) return img;

        const width = Math.max(
          5,
          Math.round((img.width ?? img.image.width) * scaleX)
        );
        const height = Math.max(
          5,
          Math.round((img.height ?? img.image.height) * scaleY)
        );

        return {
          ...img,
          x,
          y,
          width,
          height,
          rotation,
          scaleX: 1,
          scaleY: 1,
          skewX,
          skewY,
        };
      })
    );

    // Reset du scale pour éviter effet cumulatif
    node.scaleX(1);
    node.scaleY(1);
  }

  useEffect(() => {
    const stage = stageRef.current;
    const transformer = transformerRef.current;
    if (transformer && stage) {
      if (selectedId) {
        const selectedNode = stage.findOne(`#${selectedId}`);
        if (selectedNode) {
          transformer.nodes([selectedNode]);
          transformer.getLayer()?.batchDraw();
        }
      } else {
        transformer.nodes([]);
        transformer.getLayer()?.batchDraw();
      }
    }
  }, [selectedId, shapes]);

  useEffect(() => {
    const stage = stageRef.current;
    const transformer = transformerRef.current;
    if (!transformer || !stage) return;

    const selectedNode: Konva.Node | null =
      (selectedId ? stage.findOne(`#${selectedId}`) : null) ??
      (selectedImageId ? stage.findOne(`#${selectedImageId}`) : null) ??
      null;

    transformer.nodes(selectedNode ? [selectedNode] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedId, selectedImageId, shapes, imagesOnStage]);

  const handleRightClick = (e: Konva.KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault();
    const target = e.target.getParent() || e.target;
    if (target && "id" in target) {
      setContextMenu({
        visible: true,
        x: e.evt.clientX,
        y: e.evt.clientY,
        targetId: target.id(),
      });
    }
  };

  const handleClick = (e?: any) => {
    if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false });
  };

  useEffect(() => {
    if (officeList) {
      setOfficeToSelect(officeList);
    }
  }, [officeList]);

  const setIsGeneralLoadingVisible = useAdminStore(
    (state) => state.setIsGeneralLoadingVisible
  );

  const adminCompany = useAdminStore((state) => state.adminCompany);
  const { toast } = useToast();
  const router = useRouter();

  const saveMap = async () => {
    type ValidationRule = {
      condition: boolean;
      message: string;
    };

    const validations: ValidationRule[] = [
      {
        condition: !mapName,
        message: "Veuillez entrer un nom pour le plan",
      },
      {
        condition: shapes.length <= 0,
        message: "Veuillez dessiner avant de sauvegarder",
      },
      {
        condition: !shapes.some(
          (shape) =>
            (shape.type === "rectangle" ||
              shape.type === "triangle" ||
              shape.type === "polygon" ||
              shape.type === "circle") &&
            shape.spaceAssociated &&
            shape.spaceAssociated.isOffice &&
            shape.spaceAssociated.office?.id
        ),
        message:
          "Veuillez associer à la forme au moins un bureau ou un espace que vous avez créé auparavant.",
      },
    ];

    for (const rule of validations) {
      if (rule.condition) {
        toast({
          title: "Erreur",
          description: rule.message,
          variant: "destructive",
        });
        return;
      }
    }
    setIsGeneralLoadingVisible(true);

    try {
      const res = await fetch(`/api/konva-map`, {
        method: "POST",
        body: JSON.stringify({
          name: mapName,
          stageWidth: stageSize.width,
          stageHeight: stageSize.height,
          map: JSON.stringify({
            shapes: shapes,
            images: imagesOnStage,
          }),
        }),
      });
      const data = await res.json();
      toast({
        title: data.success ? "Succès" : "Erreur",
        description: data.message,
        variant: data.success ? "success" : "destructive",
      });
      if (data.success && reloadData) {
        reloadData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneralLoadingVisible(false);
    }
  };

  return (
    <>
      <div className="flex flex-col py-2 w-full h-full">
        {contextMenu.visible &&
          contextMenu.targetId &&
          (() => {
            const targetShape = shapes.find(
              (shape) => shape.id === contextMenu.targetId
            );

            return (
              <DropdownMenu
                open={contextMenu.visible}
                onOpenChange={(open) => {
                  if (!open) setContextMenu({ ...contextMenu, visible: false });
                }}
              >
                <DropdownMenuTrigger asChild>
                  <div
                    style={{
                      position: "fixed",
                      top: contextMenu.y,
                      left: contextMenu.x,
                      width: 1,
                      height: 1,
                    }}
                  />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side="right"
                  align="start"
                  style={{ minWidth: "150px", zIndex: 1000 }}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>

                  {/* Associer un bureau/espace */}
                  {targetShape &&
                    ["circle", "polygon", "rectangle", "triangle"].includes(
                      targetShape.type
                    ) && (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => {
                          setDialogOfficeOpen(true);
                          setShapeIdToAssignOffice(contextMenu.targetId!);
                          setContextMenu({ ...contextMenu, visible: false });
                        }}
                      >
                        Associer un bureau/espace à cette forme
                      </DropdownMenuItem>
                    )}

                  {/* Supprimer */}
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      if (targetShape) {
                        if (
                          targetShape.type !== "polyline" &&
                          targetShape.type !== "arrow" &&
                          targetShape.spaceAssociated?.isOffice &&
                          targetShape.spaceAssociated.office &&
                          officeToSelect
                        ) {
                          const off = officeList?.find(
                            (office) =>
                              office.id ===
                              targetShape.spaceAssociated?.office?.id
                          );
                          if (off) setOfficeToSelect([...officeToSelect, off]);
                        }

                        setShapes((prev) =>
                          prev.filter(
                            (shape) => shape.id !== contextMenu.targetId
                          )
                        );
                        if (selectedId === contextMenu.targetId)
                          setSelectedId(null);
                      }

                      if (selectedImageId) {
                        setImagesOnStage((prev) =>
                          prev.filter((image) => image.id !== selectedImageId)
                        );
                      }

                      setContextMenu({ ...contextMenu, visible: false });
                    }}
                  >
                    Supprimer
                  </DropdownMenuItem>

                  {/* Annuler */}
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      if (selectedId === contextMenu.targetId)
                        setSelectedId(null);
                      setContextMenu({ ...contextMenu, visible: false });
                    }}
                  >
                    Annuler
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })()}
        <div className="w-fit mx-auto">
          <div className="bg-white border border-slate-100 shadow-sm p-2 rounded-md flex gap-2 items-center justify-center">
            {buttonList.map((button) => (
              <Button
                key={button.id}
                onClick={() => setActiveButton(button.id)}
                variant="ghost"
                size="icon"
                className={`size-8 ${
                  button.id === activeButton
                    ? "bg-cDefaultPrimary-100 hover:bg-cDefaultPrimary-100 hover:text-white text-white"
                    : ""
                }`}
              >
                {button.content}
              </Button>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-8 p-3 cursor-pointer"
                  style={{
                    backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
                  }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <RgbaColorPicker color={color} onChange={setColor} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex gap-2 px-3 pt-3">
          <div className="flex-1">
            <Input
              placeholder="Nom du plan (Ex: Plan du 2ème étage)"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
            />
          </div>
          <Button
            onClick={saveMap}
            variant={"ghost"}
            className="bg-cDefaultPrimary-100 hover:bg-cDefaultPrimary-200 text-white hover:text-white "
          >
            Enregistrer
          </Button>
        </div>
        <div className="flex gap-2 mt-4">
          {pngList.map((png) => (
            <div key={png.id} className="relative">
              <img
                src={png.src}
                alt={png.id}
                width={100}
                height={100}
                className="cursor-pointer border p-1"
                onClick={() => setSelectedPng(png)}
              />
              {selectedPng?.id === png.id && (
                <button
                  className="absolute top-0 left-0 bg-green-500/60 text-white px-2 py-1 text-sm backdrop-blur-sm shadow-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    handleInsertPng(png);
                  }}
                >
                  Ajouter au stage
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="w-full h-full flex-1 p-3 pb-0">
          <ResizablePanelGroup direction="horizontal" className="">
            <ResizablePanel defaultSize={50}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={270}>
                  <div className="flex h-full items-center justify-center pb-6">
                    <div
                      ref={containerRef}
                      className="w-full h-full focus:outline-none"
                      tabIndex={0} /* Pour focus clavier */
                    >
                      <Stage
                        ref={stageRef}
                        width={stageSize.width}
                        height={stageSize.height}
                        style={{ background: "#f0f0f0" }}
                        onPointerDown={(e) => {
                          handleClick();
                          handleDeselect(e);
                          if (e.target === e.currentTarget) {
                            setSelectedId(null);
                            setSelectedImageId(null);
                          }

                          if (e.evt.button !== 2) onPointerDown();
                        }}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onContextMenu={handleRightClick}
                      >
                        {/* Grille sous les formes */}
                        <Layer>
                          {[
                            ...Array(Math.ceil(stageSize.width / GRID_SIZE)),
                          ].map((_, i) => (
                            <Line
                              key={"v" + i}
                              points={[
                                i * GRID_SIZE,
                                0,
                                i * GRID_SIZE,
                                stageSize.height,
                              ]}
                              stroke="#ddd"
                              strokeWidth={1}
                            />
                          ))}
                          {[
                            ...Array(Math.ceil(stageSize.height / GRID_SIZE)),
                          ].map((_, i) => (
                            <Line
                              key={"h" + i}
                              points={[
                                0,
                                i * GRID_SIZE,
                                stageSize.width,
                                i * GRID_SIZE,
                              ]}
                              stroke="#ddd"
                              strokeWidth={1}
                            />
                          ))}
                        </Layer>

                        <Layer>
                          {shapes.map(renderShape)}
                          {/* Aperçu polyline en live */}
                          {activeButton === "polyline" &&
                            polylinePoints.length > 0 &&
                            mousePos && (
                              <Line
                                points={[
                                  ...polylinePoints,
                                  mousePos.x,
                                  mousePos.y,
                                ]}
                                stroke={`rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`}
                                strokeWidth={2}
                                lineCap="round"
                                lineJoin="round"
                                dash={[10, 5]}
                                onDragMove={(e) => {
                                  const node = e.target;
                                  node.x(snapToGrid(node.x()));
                                  node.y(snapToGrid(node.y()));
                                }}
                              />
                            )}
                          {activeButton === "polygon" &&
                            polygonPoints.length > 0 &&
                            mousePos && (
                              <Line
                                points={[
                                  ...polygonPoints.flatMap((p) => [p.x, p.y]),
                                  mousePos.x,
                                  mousePos.y,
                                ]}
                                stroke={`rgba(${color.r}, ${color.g}, ${color.b}, 1)`}
                                fill={`rgba(${color.r}, ${color.g}, ${color.b}, 0.2)`}
                                strokeWidth={2}
                                lineCap="round"
                                lineJoin="round"
                                dash={[10, 5]}
                                closed
                              />
                            )}
                        </Layer>

                        <Layer>
                          <Transformer
                            ref={transformerRef}
                            rotateEnabled={true}
                            enabledAnchors={[
                              "top-left",
                              "top-right",
                              "bottom-left",
                              "bottom-right",
                              "middle-left",
                              "middle-right",
                              "top-center",
                              "bottom-center",
                            ]}
                            boundBoxFunc={(oldBox, newBox) => {
                              if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                              }
                              return newBox;
                            }}
                          />
                        </Layer>
                        <Layer>
                          {imagesOnStage.map((imgObj) => (
                            <React.Fragment key={imgObj.id}>
                              {renderImage(imgObj)}
                            </React.Fragment>
                          ))}
                        </Layer>
                      </Stage>
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={75}>
                  <div className="h-full justify-center pt-1 pb-6 flex gap-2 ">
                    <div>
                      <Image
                        src="/images/arrow.png"
                        alt="Flèche"
                        width={100}
                        height={100}
                      />
                    </div>
                    <div className="text-sm relative top-[45px] ">
                      Vous pouvez augmenter/diminuer la taille du 'Stage' en
                      étirant sur cette ligne avec votre souris
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
      <Dialog open={dialogOfficeOpen} onOpenChange={setDialogOfficeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Liste des bureaux/espaces déjà créés</DialogTitle>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Veuillez choisir le bureau ou type d‘espace associé à cette
                forme
              </p>
              <div className="space-y-2">
                <RadioGroup
                  value={selectedSpace}
                  onValueChange={setSelectedSpace}
                >
                  {spacesList.map((space, i) => (
                    <div className="flex items-center space-x-2" key={i}>
                      <RadioGroupItem value={space.id} id={space.id} />
                      <Label className="cursor-pointer" htmlFor={space.id}>
                        {" "}
                        {space.label}{" "}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {selectedSpace === "bureau" && officeToSelect && (
                  <Select
                    value={selectedOfficeId}
                    onValueChange={setSelectedOfficeId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Bureau/espace" />
                    </SelectTrigger>
                    <SelectContent>
                      {officeToSelect.map((office, i) => (
                        <SelectItem key={i} value={`${office.id}`}>
                          {office.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      if (shapeIdToAssignOffice) {
                        const selectedSpaceBrut = spacesList.find(
                          (space) => space.id === selectedSpace
                        );
                        if (selectedSpaceBrut) {
                          const updatedShapes = shapes.map((item) => {
                            if (item.id !== shapeIdToAssignOffice) return item;

                            // Récupère l'objet office sélectionné s'il y en a un
                            const selectedOffice =
                              selectedSpace === "bureau" &&
                              selectedOfficeId &&
                              officeList
                                ? officeList.find(
                                    (office) =>
                                      `${office.id}` === selectedOfficeId
                                  )
                                : undefined;

                            return {
                              ...item,
                              spaceAssociated: {
                                label: selectedOffice
                                  ? selectedOffice.name
                                  : selectedSpaceBrut.label,
                                isOffice: selectedSpace === "bureau",
                                office: selectedOffice
                                  ? {
                                      id: selectedOffice.id,
                                      name: selectedOffice.name,
                                    }
                                  : undefined,
                              },
                            };
                          });
                          setShapes(updatedShapes);
                          setDialogOfficeOpen(false);
                          setShapeIdToAssignOffice(undefined);

                          if (officeToSelect) {
                            const newOfficeList = officeToSelect.filter(
                              (office) => `${office.id}` !== selectedOfficeId
                            );
                            setOfficeToSelect(newOfficeList);
                          }
                          setSelectedOfficeId(undefined);
                        }
                      }
                    }}
                    variant="ghost"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white hover:text-white"
                  >
                    Enregistrer
                  </Button>
                </div>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={isTextEditorVisible}
        onOpenChange={setIsTextEditorVisible}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Valeur du texte</AlertDialogTitle>
            <AlertDialogDescription>
              Veuillez entrer la valeur du texte
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <Input
              type="text"
              value={textEditorValue}
              onChange={(e) => setTextEditorValue(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setTextEditorValue(undefined);
                setIsTextEditorVisible(false);
                setTextShapeToEdit(undefined);
              }}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={validateTextEditor}>
              Valider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
