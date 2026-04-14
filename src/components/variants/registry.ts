import type { ImageCropperToolbarComponent, ImageCropperUIVariant } from "../../types";
import { CardCropperToolbar } from "./CardCropperToolbar";
import { DefaultCropperToolbar } from "./DefaultCropperToolbar";

/** Root / viewport class names and toolbar for each built-in `uiVariant`. Add entries when introducing new variants. */
export interface ImageCropperVariantConfig {
  rootClassName?: string;
  viewportClassName?: string;
  Toolbar: ImageCropperToolbarComponent;
}

export const IMAGE_CROPPER_VARIANT_REGISTRY: Record<
  ImageCropperUIVariant,
  ImageCropperVariantConfig
> = {
  default: {
    Toolbar: DefaultCropperToolbar
  },
  card: {
    rootClassName: "ic-root--card",
    viewportClassName: "ic-viewport--card",
    Toolbar: CardCropperToolbar
  }
};
