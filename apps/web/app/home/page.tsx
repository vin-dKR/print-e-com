import HeroSection from "../components/HeroSection";
import PopularProducts from "../components/PopularProducts";
import BestSeller from "../components/BestSeller";
import CategoryProducts from "../components/CategoryProducts";
import CustomizableCarousel from "../components/CustomizableCarousel";
import Testimonials from "../components/Testimonials";
import NewArrivalProducts from "../components/NewArrivalProducts";

export default function Home() {
    return (
        <div className="min-h-screen">
            <HeroSection />
            <CategoryProducts />
            <NewArrivalProducts />
            <PopularProducts />
            <BestSeller />
            <CustomizableCarousel />
            <Testimonials />
        </div>
    );
}
