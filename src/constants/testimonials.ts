import type { Testimonial } from '../types/testimonial';

export const testimonials: Testimonial[] = [
  {
    id: 1,
    content: "Exploring the Swiss Alps was an unforgettable experience! The guided tour made it stress-free and absolutely stunning.",
    author: "Anna Smith",
    role: "Traveler",
    image: "https://images.unsplash.com/photo-1543349685-cacd407b3e7b"
  },
  {
    id: 2,
    content: "The beach resort in Maldives was a slice of paradise. The travel agency handled everything perfectly from start to finish.",
    author: "James Lee",
    role: "Vacationer",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
  },
  {
    id: 3,
    content: "My family loved our cultural trip to Japan. The attention to detail in the itinerary was exceptional!",
    author: "Maria Gonzalez",
    role: "Tourist",
    image: "https://images.unsplash.com/photo-1558981402-402a04542936"
  },
  {
    id: 4,
    content: "A dream come true! The safari in Africa was a life-changing adventure. Highly recommend this travel service.",
    author: "Oliver Brown",
    role: "Explorer",
    image: "https://images.unsplash.com/photo-1543946607-17b44fa06c36"
  }
] as const;
