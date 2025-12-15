import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, Circle, Rect, PencilBrush } from "fabric";
import { DrawingToolbar, DrawingTool } from "./DrawingToolbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";
import { apiClient } from "@/lib/api";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useBlackboardVideo } from "@/hooks/useApi";

interface DrawingCanvasProps {
  subchapterId: string;
  subchapterTitle: string;
  persistedCanvasData?: string | null;
  persistedAnalysis?: string;
  persistedVideo?: string;
  onCanvasDataChange?: (data: string) => void;
  onAnalysisChange?: (analysis: string) => void;
  onVideoChange?: (video: string) => void;
}

export const DrawingCanvas = ({
  subchapterId,
  subchapterTitle,
  persistedCanvasData,
  persistedAnalysis,
  persistedVideo,
  onCanvasDataChange,
  onAnalysisChange,
  onVideoChange
}: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#000000");
  const [activeTool, setActiveTool] = useState<DrawingTool>("draw");
  const [brushSize, setBrushSize] = useState(3);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>(persistedAnalysis || "");

  const { toast } = useToast();
  const { blackboardStatus } = useBlackboardVideo(subchapterId, true, 15000);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 700,
      height: 500,
      backgroundColor: "#ffffff",
    });

    if (persistedCanvasData) {
      try {
        canvas.loadFromJSON(persistedCanvasData, () => {
          canvas.renderAll();
          toast({
            title: "Canvas Restored",
            description: "Your previous drawing has been restored!",
          });
        });
      } catch (error) {
        console.error("Failed to restore canvas data:", error);
      }
    }

    const saveCanvasData = () => {
      if (onCanvasDataChange) {
        const canvasData = JSON.stringify(canvas.toJSON());
        onCanvasDataChange(canvasData);
      }
    };

    canvas.on('path:created', saveCanvasData);
    canvas.on('object:added', saveCanvasData);
    canvas.on('object:removed', saveCanvasData);
    canvas.on('object:modified', saveCanvasData);

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [persistedCanvasData, onCanvasDataChange, toast]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";

    if (activeTool === "draw") {
      const brush = new PencilBrush(fabricCanvas);
      brush.color = activeColor;
      brush.width = brushSize;
      fabricCanvas.freeDrawingBrush = brush;
    }

    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
    }
  }, [activeTool, activeColor, brushSize, fabricCanvas]);

  const handleToolClick = (tool: DrawingTool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === "rectangle") {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: "transparent",
        stroke: activeColor,
        strokeWidth: 2,
        width: 100,
        height: 100,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
    } else if (tool === "circle") {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: "transparent",
        stroke: activeColor,
        strokeWidth: 2,
        radius: 50,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
    }
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();

    setAnalysisResult("");
    onCanvasDataChange?.("");
    onAnalysisChange?.("");
    onVideoChange?.("");

    toast({
      title: "Canvas Cleared",
      description: "Canvas has been cleared successfully!",
    });
  };

  const handleDelete = useCallback(() => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      fabricCanvas.remove(...activeObjects);
      fabricCanvas.discardActiveObject();
      toast({
        title: "Objects Deleted",
        description: `Deleted ${activeObjects.length} object(s)`,
      });
    }
  }, [fabricCanvas, toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDelete]);

  const analyzeDrawing = async () => {
    if (!fabricCanvas) return;

    const objects = fabricCanvas.getObjects();
    if (objects.length === 0) {
      toast({
        title: "No Drawing",
        description: "Please draw something on the canvas first!",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult("");

    try {
      const imageData = fabricCanvas.toDataURL({
        format: 'png',
        quality: 0.8,
        multiplier: 1,
      });

      toast({
        title: "Analyzing",
        description: "Analyzing drawing with AI...",
      });

      // Placeholder for actual API call
      const analysis = "Drawing analysis will be implemented when backend is connected.";
      setAnalysisResult(analysis);
      onAnalysisChange?.(analysis);

      toast({
        title: "Analysis Complete",
        description: "Your drawing has been analyzed!",
      });

    } catch (error) {
      console.error("Error analyzing drawing:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze drawing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <DrawingToolbar
              activeTool={activeTool}
              onToolClick={handleToolClick}
              activeColor={activeColor}
              onColorChange={setActiveColor}
              brushSize={brushSize}
              onBrushSizeChange={setBrushSize}
              onClear={handleClear}
              onDelete={handleDelete}
            />

            <Button
              onClick={analyzeDrawing}
              disabled={isAnalyzing}
              className="min-w-[200px]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Analyze & Generate Video
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="flex justify-center bg-white border rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              className="block cursor-crosshair"
              style={{ touchAction: 'none' }}
            />
          </div>
        </CardContent>
      </Card>

      <VideoPlayer
        subchapterId={subchapterId}
        videoStatus={blackboardStatus?.status || 'not_started'}
        videoProgress={blackboardStatus?.progress || 0}
        videoFilePath={blackboardStatus?.filePath}
        audioFilePath={null}
        videoMessage={blackboardStatus?.message}
        videoType="blackboard"
      />

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Use the drawing tools to visualize "{subchapterTitle}".
          Click "Analyze & Generate Video" to get AI feedback.
          Press Delete or Backspace to remove selected objects.
        </p>
      </div>
    </div>
  );
};
