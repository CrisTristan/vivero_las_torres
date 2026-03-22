export type PlantType = 'Interior' | 'Exterior';
export type CareLevel = 'Bajo' | 'Medio' | 'Alto';
export type ProductCategoryType = 'Plantas' | 'Macetas' | 'Piedras' | 'Tierra' | 'Pasto' | 'Fertilizantes' | 'Plaguicidas' | 'Herbicidas';

export interface AdminPlantProduct {
  id: number;
  name: string;
  productCategory: ProductCategoryType;
  category: string;
  price: number;
  statusLabel: string;
  stockText: string;
  imageUrl?: string;
  location: PlantType;
  description: string;
  careLevel: CareLevel;
}
