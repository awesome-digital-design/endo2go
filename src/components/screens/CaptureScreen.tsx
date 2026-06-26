import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fileToDataUrl } from "@/lib/image";

const MAX_IMAGES = 5;

interface Props {
  images: string[];
  setImages: (imgs: string[]) => void;
  onSubmit: () => void;
}

export function CaptureScreen({ images, setImages, onSubmit }: Props) {
  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - images.length;
    const urls = await Promise.all(files.slice(0, remaining).map(fileToDataUrl));
    setImages([...images, ...urls].slice(0, MAX_IMAGES));
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-medium">Menukaart fotograferen</h1>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input px-4 py-8 text-center transition-colors hover:border-primary hover:bg-primary/5">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Camera className="size-6" />
        </span>
        <span className="text-sm font-medium">Maak een foto</span>
        <span className="text-xs text-muted-foreground">
          of kies uit je bestanden
        </span>
        <Input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={handleFiles}
          disabled={images.length >= MAX_IMAGES}
        />
      </label>

      {images.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-2">
            {images.map((src, index) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-lg border border-input"
              >
                <img
                  src={src}
                  alt={`Foto ${index + 1}`}
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  aria-label={`Foto ${index + 1} verwijderen`}
                  className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm hover:bg-background"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-right text-xs text-muted-foreground">
            {images.length} / {MAX_IMAGES}
          </p>
        </div>
      )}

      <Button
        className="w-full"
        disabled={images.length === 0}
        onClick={onSubmit}
      >
        Analyseer
      </Button>
    </div>
  );
}
