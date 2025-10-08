"use client";
import React, { useState, useRef } from "react";
import { Stage, Layer, Image, Rect, Text, Transformer } from "react-konva";
import useImage from "use-image";
import { saveAs } from "file-saver";

// Import Black Glass UI Components
import { TopToolbar } from "../ui-components/TopToolbar";
import { LeftToolbar } from "../ui-components/LeftToolbar";
import { PropertiesPanel } from "../ui-components/PropertiesPanel";
import { Theme } from "../ui-components/ThemeSwitcher";
import BlackGlassTextTool from "./BlackGlassTextTool";

export type Shape = {
  id: string;
  type: "text" | "image" | "button" | "terms" | "rectangle";
  x: number;
  y: number;
  rotation?: number;
  scaleX: number;
  scaleY: number;
  width: number;
  height?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  textColor?: string;
  fontStyle?: string;
  fontWeight?: number;
  textDecoration?: string;
  underlineOffset?: number;
  letterSpacing?: number;
  align?: string;
  image?: HTMLImageElement;
  cornerRadius?: number;
  stroke?: string;
  strokeWidth?: number;
  fontVariant?: string;
};

export function AdvancedImageEditorWithGlassUI() {
  const [imageUrl, setImageUrl] = useState("/images/lkb_placeholder.jpg");
  const [backgroundImage] = useImage(imageUrl, "anonymous");
  const [viewportZoom, setViewportZoom] = useState(1);

  // Black Glass UI Theme
  const [currentTheme, setCurrentTheme] = useState<Theme>("dark");

  // Logo images
  const [logoBlack] = useImage("/images/logo_lkb_black.svg");
  const [logoWhite] = useImage("/images/logo_lkb_white.svg");
  const [logoBennettBlack] = useImage("/images/logo_lkbennett_black.svg");
  const [logoBennettWhite] = useImage("/images/logo_lkbennett_white.svg");

  const [imageAttrs, setImageAttrs] = useState({ x: 0, y: 0, scale: 1 });
  const [showTextTool, setShowTextTool] = useState(false);

  const [canvas, setCanvas] = useState<{
    id: string;
    width: number;
    height: number;
    shapes: Shape[];
  }>({
    id: "canvas-1",
    width: 600,
    height: 400,
    shapes: [
      {
        id: "header-1",
        type: "text",
        text: "Welcome to the Advanced Editor",
        x: 50,
        y: 60,
        fontSize: 48,
        fontFamily: "Arial",
        fill: "#000000",
        width: 300,
        scaleX: 1,
        scaleY: 1,
        fontWeight: 400,
        fontStyle: "normal",
        letterSpacing: 0,
        align: "left",
      },
      {
        id: "text-1",
        type: "text",
        text: "Now with Black Glass UI!",
        x: 50,
        y: 120,
        fontSize: 38,
        fontFamily: "Arial",
        fill: "#000000",
        width: 400,
        scaleX: 1,
        scaleY: 1,
        fontWeight: 400,
        fontStyle: "normal",
        letterSpacing: 0,
        align: "left",
      },
    ],
  });

  const [selectedShapeIds, setSelectedShapeIds] = useState<string[]>([]);

  const [gradientColors, setGradientColors] = useState([
    { color: "#00C7BE", stop: 0.36, opacity: 1 },
    { color: "#55BEF0", stop: 0.48, opacity: 1 },
  ]);
  const [gradientRotation, setGradientRotation] = useState(21);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  const [activeLogo, setActiveLogo] = useState("logo-black");

  const [terms, setTerms] = useState("T&Cs Apply");
  const [isTermsVisible, setIsTermsVisible] = useState(true);

  const stageRef = useRef<any>(null);
  const editorRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleExport = () => {
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    saveAs(uri, "canvas.png");
  };

  const handleZoomChange = (newZoom: number) => {
    if (!backgroundImage) return;
    const { x, y, scale } = imageAttrs;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const oldScale = scale;
    const mousePointTo = {
      x: (centerX - x) / oldScale,
      y: (centerY - y) / oldScale,
    };
    const newPos = {
      x: centerX - mousePointTo.x * newZoom,
      y: centerY - mousePointTo.y * newZoom,
    };
    setImageAttrs({ ...newPos, scale: newZoom });
  };

  // Get current logo image
  const getCurrentLogoImage = () => {
    switch (activeLogo) {
      case "logo-black":
        return logoBlack;
      case "logo-white":
        return logoWhite;
      case "logo-bennett-black":
        return logoBennettBlack;
      case "logo-bennett-white":
        return logoBennettWhite;
      default:
        return logoBlack;
    }
  };

  const handlePropertyChange = (property: keyof Shape, value: any) => {
    setCanvas((prev) => ({
      ...prev,
      shapes:
        prev.shapes?.map((shape) =>
          selectedShapeIds.includes(shape.id)
            ? { ...shape, [property]: value }
            : shape
        ) || [],
    }));
  };

  const handleBatchPropertyChange = (updates: Partial<Shape>) => {
    setCanvas((prev) => ({
      ...prev,
      shapes:
        prev.shapes?.map((shape) =>
          selectedShapeIds.includes(shape.id) ? { ...shape, ...updates } : shape
        ) || [],
    }));
  };

  const handleAlign = (
    alignment: "left" | "center" | "right" | "top" | "middle" | "bottom"
  ) => {
    if (selectedShapeIds.length === 0) return;
    const canvasCenter = { x: canvas.width / 2, y: canvas.height / 2 };
    setCanvas((prev) => ({
      ...prev,
      shapes: prev.shapes.map((shape) => {
        if (!selectedShapeIds.includes(shape.id)) return shape;
        let newX = shape.x;
        let newY = shape.y;
        switch (alignment) {
          case "left":
            newX = 10;
            break;
          case "center":
            newX = canvasCenter.x - (shape.width || 100) / 2;
            break;
          case "right":
            newX = canvas.width - (shape.width || 100) - 10;
            break;
          case "top":
            newY = 10;
            break;
          case "middle":
            newY = canvasCenter.y - (shape.height || 50) / 2;
            break;
          case "bottom": {
            const elementHeight =
              shape.type === "text" ? shape.fontSize || 18 : shape.height || 50;
            newY = canvas.height - elementHeight - 10;
            break;
          }
        }
        return { ...shape, x: newX, y: newY };
      }),
    }));
  };

  const addTextElement = () => {
    const newId = `text-${Date.now()}`;
    const newText: Shape = {
      id: newId,
      type: "text",
      text: "New Text",
      x: 50,
      y: 50,
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#000000",
      width: 200,
      scaleX: 1,
      scaleY: 1,
      fontWeight: 400,
      fontStyle: "normal",
      letterSpacing: 0,
      align: "left",
    };
    setCanvas((prev) => ({ ...prev, shapes: [...(prev.shapes || []), newText] }));
    setSelectedShapeIds([newId]);
  };

  const addButton = () => {
    const newId = `button-${Date.now()}`;
    const newButton: Shape = {
      id: newId,
      type: "button",
      text: "Click Me",
      x: 100,
      y: 100,
      width: 150,
      height: 50,
      fill: "#000000",
      textColor: "#ffffff",
      fontSize: 16,
      fontFamily: "Arial",
      scaleX: 1,
      scaleY: 1,
      cornerRadius: 5,
    };
    setCanvas((prev) => ({ ...prev, shapes: [...(prev.shapes || []), newButton] }));
    setSelectedShapeIds([newId]);
  };

  const addRectangle = () => {
    const newId = `rectangle-${Date.now()}`;
    const newRect: Shape = {
      id: newId,
      type: "rectangle",
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      fill: "#ffffff",
      stroke: "#000000",
      strokeWidth: 2,
      cornerRadius: 0,
      scaleX: 1,
      scaleY: 1,
    };
    setCanvas((prev) => ({ ...prev, shapes: [...(prev.shapes || []), newRect] }));
    setSelectedShapeIds([newId]);
  };

  const resetCanvas = () => {
    setCanvas({ id: "canvas-1", width: 600, height: 400, shapes: [] });
    setSelectedShapeIds([]);
  };

  const selectedShape =
    canvas.shapes?.find((s) => selectedShapeIds.includes(s.id)) || null;

  return (
    <div
      id="bg-editor"
      className={`size-full flex flex-col ${
        currentTheme === "dark" ? "bg-gray-900 dark" : "bg-gray-50 light"
      }`}
    >
      {/* Top Toolbar */}
      <TopToolbar currentTheme={currentTheme} onThemeChange={setCurrentTheme} />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <LeftToolbar
          currentTheme={currentTheme}
          selectedTool="select"
          onToolChange={(tool) => {
            console.log("Tool changed to:", tool);
            if (tool === "text") {
              setShowTextTool(true);
            } else {
              setShowTextTool(false);
            }
          }}
        />

        {/* Canvas Area */}
        <div className="flex-1 relative">
          <div
            style={{
              transform: `scale(${viewportZoom})`,
              transformOrigin: "center center",
              transition: "transform 0.2s ease",
            }}
            className="flex items-center justify-center h-full"
          >
            <Stage
              width={canvas.width}
              height={canvas.height}
              className="shadow-lg"
              style={{
                borderRadius: "8px",
                boxShadow:
                  "0 0 20px rgba(255, 179, 186, 0.4), 0 0 40px rgba(255, 223, 186, 0.3), 0 0 60px rgba(255, 255, 186, 0.2), 0 0 80px rgba(186, 255, 201, 0.2), 0 0 100px rgba(186, 225, 255, 0.2), 0 0 120px rgba(212, 186, 255, 0.2)",
              }}
              ref={stageRef}
            >
              <Layer>
                {/* Background */}
                {backgroundImage ? (
                  <Image
                    image={backgroundImage}
                    x={imageAttrs.x}
                    y={imageAttrs.y}
                    scaleX={imageAttrs.scale}
                    scaleY={imageAttrs.scale}
                    draggable={true}
                    onDragStart={(e) => {
                      e.target.setAttrs({
                        shadowOffset: {
                          x: 5,
                          y: 5,
                        },
                        scaleX: e.target.scaleX() * 1.05,
                        scaleY: e.target.scaleY() * 1.05,
                      });
                    }}
                    onDragEnd={(e) => {
                      e.target.to({
                        duration: 0.5,
                        easing: Konva.Easings.ElasticEaseOut,
                        scaleX: 1,
                        scaleY: 1,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                      });
                      setImageAttrs((prev) => ({
                        ...prev,
                        x: e.target.x(),
                        y: e.target.y(),
                      }));
                    }}
                  />
                ) : (
                  <Rect
                    width={canvas.width}
                    height={canvas.height}
                    fill="purple"
                  />
                )}

                {/* Optional overlay gradient */}
                {isOverlayVisible && (
                  <Rect
                    width={canvas.width}
                    height={canvas.height}
                    fillLinearGradientStartPoint={{
                      x:
                        canvas.width / 2 -
                        (canvas.width / 2) *
                          Math.cos((gradientRotation * Math.PI) / 180),
                      y:
                        canvas.height / 2 -
                        (canvas.height / 2) *
                          Math.sin((gradientRotation * Math.PI) / 180),
                    }}
                    fillLinearGradientEndPoint={{
                      x:
                        canvas.width / 2 +
                        (canvas.width / 2) *
                          Math.cos((gradientRotation * Math.PI) / 180),
                      y:
                        canvas.height / 2 +
                        (canvas.height / 2) *
                          Math.sin((gradientRotation * Math.PI) / 180),
                    }}
                    fillLinearGradientColorStops={gradientColors.flatMap((c) => [
                      c.stop,
                      `rgba(${parseInt(c.color.slice(1, 3), 16)}, ${parseInt(
                        c.color.slice(3, 5),
                        16
                      )}, ${parseInt(c.color.slice(5, 7), 16)}, ${c.opacity})`,
                    ])}
                    listening={false}
                  />
                )}

                {/* Render rectangles first (backgrounds) */}
                {canvas.shapes
                  ?.filter((shape) => shape.type === "rectangle")
                  .map((shape) => (
                    <Rect
                      key={`${shape.id}-${shape.fill}-${shape.stroke}`}
                      id={shape.id}
                      x={shape.x}
                      y={shape.y}
                      width={shape.width || 200}
                      height={shape.height || 100}
                      fill={shape.fill || "#ffffff"}
                      stroke={shape.stroke || "#000000"}
                      strokeWidth={shape.strokeWidth || 0}
                      cornerRadius={shape.cornerRadius || 0}
                      draggable={true}
                      onClick={(e) => {
                        e.cancelBubble = true;
                        setSelectedShapeIds([shape.id]);
                      }}
                      onDragStart={(e) => {
                        e.target.setAttrs({
                          shadowOffset: {
                            x: 3,
                            y: 3,
                          },
                          scaleX: e.target.scaleX() * 1.02,
                          scaleY: e.target.scaleY() * 1.02,
                        });
                      }}
                      onDragEnd={(e) => {
                        e.target.to({
                          duration: 0.3,
                          easing: Konva.Easings.ElasticEaseOut,
                          scaleX: 1,
                          scaleY: 1,
                          shadowOffsetX: 0,
                          shadowOffsetY: 0,
                        });
                        setCanvas((prev) => ({
                          ...prev,
                          shapes:
                            prev.shapes?.map((s) =>
                              s.id === shape.id
                                ? { ...s, x: e.target.x(), y: e.target.y() }
                                : s
                            ) || [],
                        }));
                      }}
                    />
                  ))}

                {/* Render other shapes on top */}
                {canvas.shapes?.map((shape) => {
                  if (shape.type === "text") {
                    const padding = shape.strokeWidth || 10;
                    const fontSize = shape.fontSize || 18;
                    const lineHeightMultiplier = shape.height || 1.2;
                    const lineHeight = fontSize * lineHeightMultiplier;
                    const lines = (shape.text || "").split("\n").length;
                    const textHeight = lineHeight * lines;

                    return (
                      <React.Fragment key={shape.id}>
                        {shape.stroke && (
                          <Rect
                            x={shape.x - padding}
                            y={shape.y - padding}
                            width={(shape.width || 200) + padding * 2}
                            height={textHeight + padding * 2}
                            fill={shape.stroke}
                            cornerRadius={0}
                            listening={false}
                          />
                        )}
                        <Text
                          id={shape.id}
                          text={shape.text || ""}
                          x={shape.x}
                          y={shape.y}
                          fontSize={fontSize}
                          fontFamily={shape.fontFamily || "Arial"}
                          fontWeight={
                            shape.fontWeight ? String(shape.fontWeight) : "400"
                          }
                          fontStyle={shape.fontStyle || "normal"}
                          fill={shape.fill || "#000000"}
                          width={shape.width || 200}
                          letterSpacing={shape.letterSpacing || 0}
                          align={shape.align || "left"}
                          textDecoration={shape.textDecoration}
                          underlineOffset={shape.underlineOffset}
                          draggable={true}
                          onClick={(e) => {
                            e.cancelBubble = true;
                            setSelectedShapeIds([shape.id]);
                          }}
                          onDragStart={(e) => {
                            e.target.setAttrs({
                              shadowOffset: {
                                x: 3,
                                y: 3,
                              },
                              scaleX: e.target.scaleX() * 1.02,
                              scaleY: e.target.scaleY() * 1.02,
                            });
                          }}
                          onDragEnd={(e) => {
                            e.target.to({
                              duration: 0.3,
                              easing: Konva.Easings.ElasticEaseOut,
                              scaleX: 1,
                              scaleY: 1,
                              shadowOffsetX: 0,
                              shadowOffsetY: 0,
                            });
                            setCanvas((prev) => ({
                              ...prev,
                              shapes:
                                prev.shapes?.map((s) =>
                                  s.id === shape.id
                                    ? { ...s, x: e.target.x(), y: e.target.y() }
                                    : s
                                ) || [],
                            }));
                          }}
                        />
                      </React.Fragment>
                    );
                  } else if (shape.type === "image") {
                    const logoImage = getCurrentLogoImage();
                    return logoImage ? (
                      <Image
                        key={`${shape.id}-${activeLogo}`}
                        id={shape.id}
                        image={logoImage}
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        scaleX={shape.scaleX}
                        scaleY={shape.scaleY}
                        draggable={true}
                        onClick={(e) => {
                          e.cancelBubble = true;
                          setSelectedShapeIds([shape.id]);
                        }}
                        onDragStart={(e) => {
                          e.target.setAttrs({
                            shadowOffset: {
                              x: 3,
                              y: 3,
                            },
                            scaleX: e.target.scaleX() * 1.02,
                            scaleY: e.target.scaleY() * 1.02,
                          });
                        }}
                        onDragEnd={(e) => {
                          e.target.to({
                            duration: 0.3,
                            easing: Konva.Easings.ElasticEaseOut,
                            scaleX: 1,
                            scaleY: 1,
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                          });
                          setCanvas((prev) => ({
                            ...prev,
                            shapes:
                              prev.shapes?.map((s) =>
                                s.id === shape.id
                                  ? {
                                      ...s,
                                      x: e.target.x(),
                                      y: e.target.y(),
                                    }
                                  : s
                              ) || [],
                          }));
                        }}
                      />
                    ) : null;
                  } else if (shape.type === "button") {
                    return (
                      <React.Fragment key={shape.id}>
                        <Rect
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          width={shape.width}
                          height={shape.height || 50}
                          fill={shape.fill || "#000000"}
                          stroke={shape.stroke}
                          strokeWidth={shape.strokeWidth || 0}
                          cornerRadius={shape.cornerRadius || 0}
                          draggable={true}
                          onClick={(e) => {
                            e.cancelBubble = true;
                            setSelectedShapeIds([shape.id]);
                          }}
                          onDragStart={(e) => {
                            e.target.setAttrs({
                              shadowOffset: {
                                x: 3,
                                y: 3,
                              },
                              scaleX: e.target.scaleX() * 1.02,
                              scaleY: e.target.scaleY() * 1.02,
                            });
                          }}
                          onDragEnd={(e) => {
                            e.target.to({
                              duration: 0.3,
                              easing: Konva.Easings.ElasticEaseOut,
                              scaleX: 1,
                              scaleY: 1,
                              shadowOffsetX: 0,
                              shadowOffsetY: 0,
                            });
                            setCanvas((prev) => ({
                              ...prev,
                              shapes:
                                prev.shapes?.map((s) =>
                                  s.id === shape.id
                                    ? { ...s, x: e.target.x(), y: e.target.y() }
                                    : s
                                ) || [],
                            }));
                          }}
                        />
                        <Text
                          text={shape.text || "Button"}
                          x={shape.x}
                          y={
                            shape.y +
                            (shape.height || 50) / 2 -
                            (shape.fontSize || 16) / 2
                          }
                          width={shape.width}
                          fontSize={shape.fontSize || 16}
                          fontFamily={shape.fontFamily || "Arial"}
                          fill={
                            shape.textColor ||
                            (shape.fill === "transparent"
                              ? "#000000"
                              : "#ffffff")
                          }
                          align="center"
                          fontWeight={
                            shape.fontWeight ? String(shape.fontWeight) : "400"
                          }
                          textDecoration={shape.textDecoration}
                          underlineOffset={shape.underlineOffset}
                          listening={false}
                        />
                      </React.Fragment>
                    );
                  } else if (shape.type === "rectangle") {
                    // Rectangles already rendered as backgrounds
                    return null;
                  }
                  return null;
                })}

                <Transformer
                  ref={transformerRef}
                  nodes={
                    selectedShapeIds.length > 0 && stageRef.current
                      ? selectedShapeIds
                          .map((id) => stageRef.current.findOne(`#${id}`))
                          .filter(
                            (node) => node !== null && node !== undefined
                          )
                      : []
                  }
                  enabledAnchors={[
                    "top-left",
                    "top-right",
                    "bottom-left",
                    "bottom-right",
                  ]}
                  borderEnabled={false}
                  borderStroke="transparent"
                  borderStrokeWidth={0}
                  borderDash={[]}
                  anchorFill="#8B5CF6"
                  anchorStroke="#ffffff"
                  anchorStrokeWidth={2}
                  anchorSize={6}
                  anchorCornerRadius={3}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 5 || newBox.height < 5) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                  onTransformEnd={() => {
                    const nodes = selectedShapeIds
                      .map((id) => stageRef.current?.findOne(`#${id}`))
                      .filter(Boolean);
                    nodes.forEach((node: any) => {
                      if (node) {
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();
                        const shape = canvas.shapes.find(
                          (s) => s.id === node.id()
                        );
                        if (shape?.type === "text") {
                          // For text: change font size instead of scaling
                          const avgScale = (scaleX + scaleY) / 2;
                          const newFontSize = Math.max(
                            8,
                            (shape.fontSize || 18) * avgScale
                          );
                          node.scaleX(1);
                          node.scaleY(1);
                          setCanvas((prev) => ({
                            ...prev,
                            shapes: prev.shapes.map((s) =>
                              s.id === node.id()
                                ? {
                                    ...s,
                                    x: node.x(),
                                    y: node.y(),
                                    fontSize: newFontSize,
                                    rotation: node.rotation(),
                                  }
                                : s
                            ),
                          }));
                        } else {
                          // For other elements: normal scaling
                          node.scaleX(1);
                          node.scaleY(1);
                          setCanvas((prev) => ({
                            ...prev,
                            shapes: prev.shapes.map((s) =>
                              s.id === node.id()
                                ? {
                                    ...s,
                                    x: node.x(),
                                    y: node.y(),
                                    width: Math.max(5, s.width * scaleX),
                                    height: s.height
                                      ? Math.max(5, s.height * scaleY)
                                      : s.height,
                                    rotation: node.rotation(),
                                  }
                                : s
                            ),
                          }));
                        }
                      }
                    });
                  }}
                />
              </Layer>
            </Stage>
          </div>
        </div>
      </div>

      {/* Quick Text Editor Panel */}
      {selectedShape &&
        (selectedShape.type === "text" || selectedShape.type === "button") && (
          <div
            className="mt-4 p-4 bg-white rounded-lg shadow-md border"
            style={{ maxWidth: "60rem" }}
          >
            <div className="flex gap-6">
              {/* Left Side - Font Selector */}
              <div className="w-80">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Font Family</label>
                    <select
                      value={selectedShape?.fontFamily || "Arial"}
                      onChange={(e) =>
                        handlePropertyChange("fontFamily", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Font Weight</label>
                    <select
                      value={selectedShape?.fontWeight || 400}
                      onChange={(e) =>
                        handlePropertyChange(
                          "fontWeight",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value={100}>Thin (100)</option>
                      <option value={300}>Light (300)</option>
                      <option value={400}>Normal (400)</option>
                      <option value={500}>Medium (500)</option>
                      <option value={700}>Bold (700)</option>
                      <option value={900}>Black (900)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Font Style</label>
                    <select
                      value={selectedShape?.fontStyle || "normal"}
                      onChange={(e) =>
                        handlePropertyChange("fontStyle", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="normal">Normal</option>
                      <option value="italic">Italic</option>
                      <option value="oblique">Oblique</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Side - Controls */}
              <div className="flex-1 space-y-3">
                {/* Text Content */}
                <div>
                  <textarea
                    value={selectedShape?.text || ""}
                    onChange={(e) =>
                      handlePropertyChange("text", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    rows={2}
                    placeholder="Enter text..."
                  />
                </div>

                {/* Sliders Row 1 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium w-16">Size:</label>
                    <input
                      type="range"
                      min="8"
                      max="200"
                      value={selectedShape?.fontSize || 18}
                      onChange={(e) =>
                        handlePropertyChange(
                          "fontSize",
                          parseInt(e.target.value)
                        )
                      }
                      className="flex-1"
                    />
                    <span className="text-sm w-12">
                      {selectedShape?.fontSize || 18}px
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium w-16">Line:</label>
                    <input
                      type="range"
                      min="0.8"
                      max="3"
                      step="0.1"
                      value={selectedShape?.height || 1.2}
                      onChange={(e) =>
                        handlePropertyChange("height", parseFloat(e.target.value))
                      }
                      className="flex-1"
                    />
                    <span className="text-sm w-12">
                      {selectedShape?.height || 1.2}
                    </span>
                  </div>
                </div>

                {/* Sliders Row 2 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium w-16">
                      Spacing:
                    </label>
                    <input
                      type="range"
                      min="-5"
                      max="20"
                      step="0.1"
                      value={selectedShape?.letterSpacing || 0}
                      onChange={(e) =>
                        handlePropertyChange(
                          "letterSpacing",
                          parseFloat(e.target.value)
                        )
                      }
                      className="flex-1"
                    />
                    <span className="text-sm w-12">
                      {selectedShape?.letterSpacing || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium w-16">Width:</label>
                    <input
                      type="range"
                      min="50"
                      max="800"
                      value={selectedShape?.width || 200}
                      onChange={(e) =>
                        handlePropertyChange("width", parseInt(e.target.value))
                      }
                      className="flex-1"
                    />
                    <span className="text-sm w-12">
                      {selectedShape?.width || 200}px
                    </span>
                  </div>
                </div>

                {/* Colors Row */}
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Text Alignment */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handlePropertyChange("align", "left")}
                      className={`p-2 rounded border ${
                        selectedShape?.align === "left"
                          ? "bg-blue-100 border-blue-300"
                          : "bg-gray-100 border-gray-300"
                      } hover:bg-blue-50`}
                      title="Align Left"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="21" y1="10" x2="3" y2="10"></line>
                        <line x1="21" y1="6" x2="3" y2="6"></line>
                        <line x1="11" y1="14" x2="3" y2="14"></line>
                        <line x1="17" y1="18" x2="3" y2="18"></line>
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePropertyChange("align", "center")}
                      className={`p-2 rounded border ${
                        selectedShape?.align === "center"
                          ? "bg-blue-100 border-blue-300"
                          : "bg-gray-100 border-gray-300"
                      } hover:bg-blue-50`}
                      title="Align Center"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="10" x2="6" y2="10"></line>
                        <line x1="21" y1="6" x2="3" y2="6"></line>
                        <line x1="16" y1="14" x2="8" y2="14"></line>
                        <line x1="19" y1="18" x2="5" y2="18"></line>
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePropertyChange("align", "right")}
                      className={`p-2 rounded border ${
                        selectedShape?.align === "right"
                          ? "bg-blue-100 border-blue-300"
                          : "bg-gray-100 border-gray-300"
                      } hover:bg-blue-50`}
                      title="Align Right"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="13" y1="14" x2="21" y2="14"></line>
                        <line x1="7" y1="18" x2="21" y2="18"></line>
                      </svg>
                    </button>
                  </div>

                  {/* Colors */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs">Text:</label>
                    <input
                      type="color"
                      value={selectedShape?.fill || "#000000"}
                      onChange={(e) =>
                        handlePropertyChange("fill", e.target.value)
                      }
                      className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs">Background:</label>
                    <input
                      type="color"
                      value={selectedShape?.stroke || "#ffffff"}
                      onChange={(e) =>
                        handlePropertyChange("stroke", e.target.value)
                      }
                      className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <button
                      onClick={() =>
                        handlePropertyChange(
                          "stroke",
                          selectedShape?.stroke ? undefined : "#ffffff"
                        )
                      }
                      className={`px-2 py-1 text-xs rounded ${
                        selectedShape?.stroke
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {selectedShape?.stroke ? "Off" : "On"}
                    </button>
                    {selectedShape?.stroke && (
                      <>
                        <input
                          type="range"
                          min="5"
                          max="30"
                          value={selectedShape?.strokeWidth || 10}
                          onChange={(e) =>
                            handlePropertyChange(
                              "strokeWidth",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-16"
                          title="Padding"
                        />
                        <span className="text-xs">
                          {selectedShape?.strokeWidth || 10}px
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom Controls Row */}
                <div className="mt-3 flex items-center gap-4 flex-wrap">
                  {/* Canvas Alignment */}
                  <div className="flex items-center gap-1">
                    <label className="text-xs mr-1">Canvas:</label>
                    <button
                      onClick={() => handleAlign("left")}
                      className="p-1 rounded border bg-gray-100 border-gray-300 hover:bg-blue-50"
                      title="Align Left"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="3" y1="6" x2="3" y2="18"></line>
                        <line x1="7" y1="12" x2="21" y2="12"></line>
                        <line x1="7" y1="18" x2="15" y2="18"></line>
                        <line x1="7" y1="6" x2="18" y2="6"></line>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleAlign("center")}
                      className="p-1 rounded border bg-gray-100 border-gray-300 hover:bg-blue-50"
                      title="Align Center"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="12" y1="3" x2="12" y2="21"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                        <line x1="10" y1="18" x2="14" y2="18"></line>
                        <line x1="9" y1="6" x2="15" y2="6"></line>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleAlign("right")}
                      className="p-1 rounded border bg-gray-100 border-gray-300 hover:bg-blue-50"
                      title="Align Right"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="21" y1="6" x2="21" y2="18"></line>
                        <line x1="3" y1="12" x2="17" y2="12"></line>
                        <line x1="7" y1="18" x2="17" y2="18"></line>
                        <line x1="6" y1="6" x2="17" y2="6"></line>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleAlign("top")}
                      className="p-1 rounded border bg-gray-100 border-gray-300 hover:bg-blue-50"
                      title="Align Top"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="6" y1="3" x2="18" y2="3"></line>
                        <line x1="12" y1="7" x2="12" y2="21"></line>
                        <line x1="18" y1="7" x2="18" y2="15"></line>
                        <line x1="6" y1="7" x2="6" y2="18"></line>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleAlign("middle")}
                      className="p-1 rounded border bg-gray-100 border-gray-300 hover:bg-blue-50"
                      title="Align Middle"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="18" y1="10" x2="18" y2="14"></line>
                        <line x1="6" y1="9" x2="6" y2="15"></line>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleAlign("bottom")}
                      className="p-1 rounded border bg-gray-100 border-gray-300 hover:bg-blue-50"
                      title="Align Bottom"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="6" y1="21" x2="18" y2="21"></line>
                        <line x1="12" y1="3" x2="12" y2="17"></line>
                        <line x1="18" y1="9" x2="18" y2="17"></line>
                        <line x1="6" y1="6" x2="6" y2="17"></line>
                      </svg>
                    </button>
                  </div>

                  {/* Button Styles (only for buttons) */}
                  {selectedShape?.type === "button" && (
                    <div className="flex items-center gap-1">
                      <label className="text-xs mr-1">Style:</label>
                      <button
                        onClick={() => {
                          setCanvas((prev) => ({
                            ...prev,
                            shapes: prev.shapes.map((shape) =>
                              selectedShapeIds.includes(shape.id)
                                ? {
                                    ...shape,
                                    fill: "#000000",
                                    textColor: "#ffffff",
                                    stroke: undefined,
                                    strokeWidth: 0,
                                    textDecoration: undefined,
                                    underlineOffset: undefined,
                                  }
                                : shape
                            ),
                          }));
                        }}
                        className="px-3 py-1 bg-black text-white rounded text-xs"
                      >
                        Solid
                      </button>
                      <button
                        onClick={() => {
                          setCanvas((prev) => ({
                            ...prev,
                            shapes: prev.shapes.map((shape) =>
                              selectedShapeIds.includes(shape.id)
                                ? {
                                    ...shape,
                                    fill: "transparent",
                                    textColor: "#000000",
                                    stroke: "#000000",
                                    strokeWidth: 2,
                                    textDecoration: "underline",
                                    underlineOffset: 8,
                                  }
                                : shape
                            ),
                          }));
                        }}
                        className="px-3 py-1 border border-black text-black rounded text-xs"
                      >
                        Outline
                      </button>
                    </div>
                  )}

                  {/* Terms & Conditions */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs">T&Cs:</label>
                    <input
                      type="text"
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-xs w-24"
                      placeholder="T&Cs Apply"
                    />
                    <button
                      onClick={() => setIsTermsVisible(!isTermsVisible)}
                      className={`px-2 py-1 text-xs rounded ${
                        isTermsVisible
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {isTermsVisible ? "On" : "Off"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Properties Panel */}
      <PropertiesPanel
        currentTheme={currentTheme}
        selectedObject={selectedShape as any}
        onObjectChange={(updates) => {
          Object.entries(updates).forEach(([key, value]) => {
            handlePropertyChange(key as keyof Shape, value);
          });
        }}
      />

      {/* BlackGlass Text Tool */}
      {showTextTool && (
        <BlackGlassTextTool
          onTextAdd={(textData) => {
            const newText: Shape = {
              id: `text-${Date.now()}`,
              type: "text",
              x: 100,
              y: 100,
              width: 200,
              height: 50,
              text: textData.text || "New Text",
              fontSize: textData.fontSize || 16,
              fontFamily: textData.fontFamily || "Arial",
              fill: textData.color || "#000000",
              fontWeight: textData.fontWeight || 400,
              fontStyle: textData.fontStyle || "normal",
              textAlign: textData.textAlign || "left",
              letterSpacing: textData.letterSpacing || 0,
              lineHeight: textData.lineHeight || 1.2,
              scaleX: 1,
              scaleY: 1,
            };
            
            setCanvas((prev) => ({
              ...prev,
              shapes: [...prev.shapes, newText],
            }));
            
            setShowTextTool(false);
          }}
          isActive={showTextTool}
        />
      )}
    </div>
  );
}

export default AdvancedImageEditorWithGlassUI;
