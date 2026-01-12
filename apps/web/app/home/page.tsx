import HeroSection from "../components/HeroSection";
import PopularProducts from "../components/PopularProducts";
import BestSeller from "../components/BestSeller";
import CategoryProducts from "../components/CategoryProducts";
import CustomizableCarousel from "../components/CustomizableCarousel";
import Testimonials from "../components/Testimonials";
import NewArrivalProducts from "../components/NewArrivalProducts";
import BottomNavigation from "../components/shared/BottomNavigation";
import Footer from "../components/shared/Footer";

export default function Home() {
    return (
        <div className="min-h-screen bg-white pb-36 md:pb-0">
            <HeroSection />
            <CategoryProducts />
            <NewArrivalProducts />
            <PopularProducts />
            <BestSeller />
            {/* <CustomizableCarousel /> */}
            <Testimonials />
            <BottomNavigation />
        </div>
    );
}
