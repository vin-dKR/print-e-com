import HeroSection from "../components/HeroSection";
import PrintedBestProduct from "../components/PrintedBestProduct";
import PopularProducts from "../components/PopularProducts";
import BestSeller from "../components/BestSeller";
import BrandLogos from "../components/BrandLogos";
import CustomizableCarousel from "../components/CustomizableCarousel";
import Testimonials from "../components/Testimonials";

export default function Home() {
    return (
        <div className="min-h-screen">
            <HeroSection />
            <PrintedBestProduct />
            <BrandLogos />
            <PopularProducts />
            <BestSeller />
            <CustomizableCarousel />
            <Testimonials />
        </div>
    );
}
