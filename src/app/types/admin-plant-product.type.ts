export type PlantType = 'Interior' | 'Exterior';
export type CareLevel = 'Bajo' | 'Medio' | 'Alto';
export type ProductCategoryType = 'plantas' | 'macetas' | 'piedras' | 'tierra' | 'pasto' | 'fertilizantes' | 'plaguicidas' | 'herbicidas';

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
