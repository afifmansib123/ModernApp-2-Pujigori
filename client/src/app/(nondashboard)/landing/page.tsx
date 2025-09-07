"use client"
import CallToActionSection from "./CallToActionSection"
import Featuresection from "./FeatureSection"
import FooterSection from "./FooterSection"
import HeroSection from "./HeroSection"

const Landing = () => {
    return (
        <div>
            <HeroSection />
            <Featuresection/>
            <CallToActionSection/>
            <FooterSection/>
        </div>
    )
}

export default Landing