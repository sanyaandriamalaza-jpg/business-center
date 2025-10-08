"use client";

import PartialLoading from "@/src/components/global/PartialLoading";
import { ImageOnStage, KonvaMap, Office, PngItem, Shape } from "@/src/lib/type";
import { useCallback, useEffect, useRef, useState } from "react";
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
import CenteredText from "./CenteredText";
import { formatDateFr } from "@/src/lib/customfunction";
import { CustomPositionPopover } from "./CustomPositionPopover";
import Image from "next/image";

const isOfficeAvailable = (office: Office) => {
  const now = Date.now();
  const unavailableDates = office.unavailablePeriods;

  if (!unavailableDates || unavailableDates.length === 0) return true;

  const isUnavailable = unavailableDates.some((period) => {
    const start = new Date(period.from).getTime();
    const end = new Date(period.to).getTime();
    return now >= start && now <= end;
  });

  return !isUnavailable;
};

export default function KonvaViewer({
  id,
  isAdmin,
}: {
  id: number;
  isAdmin: boolean;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [mapInfo, setMapInfo] = useState<KonvaMap>();

  const stageRef = useRef<Konva.Stage | null>(null);
  const [officeList, setOfficeList] = useState<Office[]>();
  const [selectedOffice, setSelectedOffice] = useState<Office>();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [pos, setPos] = useState({ x: 100, y: 200 });
  const [imagesOnStage, setImagesOnStage] = useState<ImageOnStage[]>([]);

  const handleSelect = (e: Konva.KonvaEventObject<MouseEvent>, id: string) => {
    e.cancelBubble = true;

    const shape = mapInfo?.map.shapes.find((item) => item.id === id);
    if (
      shape &&
      (shape.type === "triangle" ||
        shape.type === "rectangle" ||
        shape.type === "circle") &&
      shape.spaceAssociated &&
      shape.spaceAssociated.isOffice &&
      shape.spaceAssociated.office
    ) {
      const officeId = shape.spaceAssociated.office.id;
      const officeInfo = officeList?.find((office) => office.id === officeId);
      setSelectedOffice(officeInfo ?? undefined);

      if (stageRef.current) {
        const stage = stageRef.current;
        const stageRect = stage.container().getBoundingClientRect();
        const pointerPos = stage.getPointerPosition();

        if (pointerPos) {
          setPos({
            x: stageRect.left + pointerPos.x,
            y: stageRect.top + pointerPos.y,
          });
        }
      }
      setPopoverOpen(true);
    }
  };

  const handleHover = (
    e: Konva.KonvaEventObject<MouseEvent>,
    shape: Shape | null
  ) => {
    if (!shape) {
      setPopoverOpen(false);
      setSelectedOffice(undefined);
      return;
    }

    if (
      shape.type === "polygon" ||
      shape.type === "triangle" ||
      shape.type === "rectangle" ||
      shape.type === "circle"
    ) {
      const officeId = shape.spaceAssociated?.office?.id;
      const officeInfo = officeList?.find((office) => office.id === officeId);
      setSelectedOffice(officeInfo);

      const stage = stageRef.current;
      if (stage) {
        const stageRect = stage.container().getBoundingClientRect();
        const pointerPos = stage.getPointerPosition();
        if (pointerPos) {
          const scale = stage.scaleX();
          const stagePos = stage.position();
          setPos({
            x: stageRect.left + pointerPos.x * scale + stagePos.x,
            y: stageRect.top + pointerPos.y * scale + stagePos.y,
          });
        }
      }
      setPopoverOpen(true);
    }
  };

  const renderShape = (shape: Shape) => {
    if (shape.type === "polyline") {
      return (
        <Line
          key={shape.id}
          points={shape.points}
          stroke={`rgba(${shape.strokeColor.r}, ${shape.strokeColor.g}, ${shape.strokeColor.b}, ${shape.strokeColor.a})`}
          strokeWidth={2}
          lineCap="round"
          lineJoin="round"
          draggable
        />
      );
    }
    if (shape.type === "polygon") {
      const polygon = (
        <Line
          key={shape.id}
          points={shape.points.flatMap((p) => [p.x, p.y])} 
          closed
          fill={`rgba(${shape.fillColor.r}, ${shape.fillColor.g}, ${shape.fillColor.b}, ${shape.fillColor.a})`}
          lineCap="round"
          lineJoin="round"
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
          onMouseEnter={(e) => {
          handleHover(e, shape);
          const container = e.target.getStage()?.container();
          if (container) container.style.cursor = "pointer";
        }}
        onMouseLeave={(e) => {
          handleHover(e, null);
          const container = e.target.getStage()?.container();
          if (container) container.style.cursor = "default";
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
            onClick={(e) => {}}
            onTap={(e) => {}}
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
        onClick={(e) => handleSelect(e, shape.id)}
        onMouseEnter={(e) => {
          handleHover(e, shape);
          const container = e.target.getStage()?.container();
          if (container) container.style.cursor = "pointer";
        }}
        onMouseLeave={(e) => {
          handleHover(e, null);
          const container = e.target.getStage()?.container();
          if (container) container.style.cursor = "default";
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
      >
        <KonvaImage
          image={imgObj.image}
          width={imgObj.width ?? imgObj.image.width}
          height={imgObj.height ?? imgObj.image.height}
        />
      </Group>
    );
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/konva-map/${id}`);
      const data = await res.json();
      if (data.success) {
        setMapInfo(data.data);
        const mapList: Shape[] = data.data.map.shapes;
        const officeListId = mapList
          .map((mapItem) => {
            if (
              (mapItem.type === "circle" ||
                mapItem.type === "rectangle" ||
                mapItem.type === "triangle") &&
              mapItem.spaceAssociated &&
              mapItem.spaceAssociated.isOffice &&
              mapItem.spaceAssociated.office
            ) {
              return mapItem.spaceAssociated.office.id;
            } else {
              return null;
            }
          })
          .filter(Boolean);

        const ids = officeListId.join(",");
        const officeRes = await fetch(`/api/office?ids=${ids}`);
        const officeData = await officeRes.json();

        if (officeData.success) {
          setOfficeList(officeData.data);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (mapInfo) {
      mapInfo.map.images.forEach((item) => {
        const img = new window.Image();
        img.src = item.url;
        img.onload = () => {
          setImagesOnStage((prev) => [
            ...prev,
            {
              id: item.id,
              image: img,
              url: item.url,
              x: item.x,
              y: item.y,
              width: item.width,
              height: item.height,
              rotation: item.rotation,
              scaleX: item.scaleX,
              scaleY: item.scaleY,
              skewX: item.skewX,
              skewY: item.skewY,
            },
          ]);
        };
      });
    }
  }, [mapInfo]);

  return (
    <>
      {loading ? (
        <div className="col-span-12 pt-10">
          <PartialLoading />
        </div>
      ) : mapInfo ? (
        <div className="col-span-8 bg-white p-4 rounded-md">
          {selectedOffice && (
            <CustomPositionPopover
              open={popoverOpen}
              onOpenChange={setPopoverOpen}
              x={pos.x}
              y={pos.y}
            >
              <div className="space-y-2">
                <div className="bg-gray-100 w-full aspect-video overflow-hidden rounded-md">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${selectedOffice?.imageUrl}`}
                    alt={`${selectedOffice.name}`}
                    width={254}
                    height={153}
                  />
                </div>
                <div className="text-sm">
                  <div className="space-y-1">
                    <div className="flex">
                      <div
                        className={`px-3 py-[2px] text-xs font-[500] rounded-md ${
                          isOfficeAvailable(selectedOffice)
                            ? "bg-green-100 text-green-600"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {isOfficeAvailable(selectedOffice)
                          ? "Disponible"
                          : "Occupé"}
                      </div>
                    </div>
                    <p className="font-medium"> {selectedOffice.name} </p>
                  </div>
                  <div className="space-y-1">
                    <p>
                      Capacité: jusqu‘à {selectedOffice.maxSeatCapacity}{" "}
                      personne
                      {selectedOffice.maxSeatCapacity > 1 ? "s" : ""}{" "}
                    </p>
                    <ul className="flex flex-wrap gap-2 text-xs">
                      {selectedOffice.features.map((feature, i) => (
                        <li
                          key={i}
                          className="bg-cDefaultPrimary-100/10 text-cDefaultPrimary-100 px-3 py-1 rounded-full flex items-center"
                        >
                          {feature.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CustomPositionPopover>
          )}
          <div className="space-y-4">
            {isAdmin && (
              <div className="space-y-2 text-sm ">
                <h1 className="uppercase font-medium">{mapInfo.name}</h1>
                <p>Créé le : {formatDateFr(mapInfo.createdAt)}</p>
                {mapInfo.updatedAt && (
                  <p>
                    Dernière mise à jour : {formatDateFr(mapInfo.updatedAt)}
                  </p>
                )}
              </div>
            )}
            <Stage
              ref={stageRef}
              width={mapInfo.stageWidth}
              height={mapInfo.stageHeight}
              style={{ background: "#F9F9F9" }}
            >
              <Layer>{mapInfo.map.shapes.map(renderShape)}</Layer>
              <Layer>
                {imagesOnStage.map((imgObj) => renderImage(imgObj))}
              </Layer>
            </Stage>
          </div>
        </div>
      ) : (
        <div className="text-center italic text-indigo-600 col-span-12 ">
          Une erreur est survenue
        </div>
      )}
    </>
  );
}
