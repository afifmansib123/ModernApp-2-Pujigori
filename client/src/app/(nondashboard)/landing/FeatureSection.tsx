"use client"
import {motion} from "framer-motion"
import Image from "next/image"
import Link from "next/link"

// a variant for the containers

const containerVariants = {
    hidden : {opacity : 0  , y: 20},
    visible : {opacity : 1, y : 0},
    transition : {
        duration : 0.5,
        staggerChildren : 0.2,
    }
}

// a variant for items inside 

const itemVariants = {
    hidden : {opacity : 0, y : 20},
    visible : {opacity : 1, y : 0},
}

const Featuresection = () => {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="py-24 px-6 sm:px-8 lg:px-12 xl:px-16 bg-white"> {/*parent design*/}

            <div className="max-w-4xl xl:max-w-6xl mx-auto">
                <motion.h2
                variants={itemVariants}
                className="text-3xl font-bold text-center mb-12 w-full sm:w-2/3 mx-auto">
                    Find Your Dream Home Today
                </motion.h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16">
                {[0,1,2].map((index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}>
                    <FeatureCard
                        imageSrc={`/landing-search${3 - index}.png`} 
                        title={
                            [
                                "Our Text",
                                "Our Text",
                                "Our Text"
                            ][index]
                        } 
                        description={
                            [
                                "A Description is a some words we use to describe something",
                                "A Description is a some words we use to describe something",
                                "A Description is a some words we use to describe something"
                            ][index]
                        }
                        linkText={
                            [
                                "Start Searching",
                                "Explore Now",
                                "Get in Touch"
                            ][index]
                        }
                        linkHref={
                            [
                                "/search",
                                "/neighborhoods",
                                "/contact"
                            ][index]
                        }/>
                    </motion.div>)
                )}
            </div>
            </motion.div>
    )
}

const FeatureCard = ({
    imageSrc,
    title,
    description,
    linkText,
    linkHref,
} : {
    imageSrc: string;
    title : string;
    description : string;
    linkText : string,
    linkHref : string,
}) => (
    <div className="text-center">
        <div className="p-4 rounded-lg mb-4 flex items-center justify-center h-48">
            <Image 
                src={imageSrc}
                width={400}
                height = {400}
                className="object-contain h-full w-full"
                alt={title}/>
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="mb-4">{description}</p>
        <Link 
            href={linkHref}
            className="inline-block px-4 py-2 rounded border-gray-300 border hover:bg-gray-100"
            scroll={false} // Prevents scrolling to the top of the page
            >
            {linkText}
        </Link>
    </div>
)

export default Featuresection;