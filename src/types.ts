export interface Plaque {
  plaque_type: string;
  plaque_image_url: string;
  plaque_price_range: string;
}

export interface Album {
  genre_id: string;
  id: string;                   
  title: string;                 
  artist: string;                
  release_date: string;
  genre: string;
  cover_art: string;
  description: string;
  track_count: number;
  copyright_info: string;
  publisher: string;
  credits: string;
  affiliation: string;
  duration: number;
  is_published: boolean;
  is_featured: boolean;
  plaqueArray: Plaque[];         
}

export interface FormData {
  artist_name: any;
  genre_id: string | number | readonly string[] | undefined;
  title: string;
  artist: string;
  release_date: string;
  genre: string;
  cover_art: string;
  description: string;
  track_count: number;
  copyright_info: string;
  publisher: string;
  credits: string;
  affiliation: string;
  duration: number;
  is_published: boolean;
  is_featured: boolean;
}
