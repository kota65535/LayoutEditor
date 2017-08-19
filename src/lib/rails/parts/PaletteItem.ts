/**
 * Created by tozawa on 2017/07/03.
 */

export enum PaletteItemType {
    RAIL,
    FEEDER,
    GAP_JOINER
}

export interface PaletteItem {

    getItemType(): PaletteItemType;
}
