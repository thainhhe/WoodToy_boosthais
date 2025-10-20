import Hero from "../components/Hero";
import About from "../components/About";
import Products from "../components/Products";
import Features from "../components/Features";
import Team from "../components/Team";
import Press from "../components/Press";
import Introduction from "../components/Introduction";
import FloatingSocial from "../components/FloatingSocial";

export default function Home() {
  // Component CTA cũ đã được tích hợp vào các section khác, nên không cần nữa.
  return (
    <main>
      <Hero />
      <Introduction />
      <About />
      <Products />
      <Features />
      <Team />
      <Press />
      <FloatingSocial />
    </main>
  );
}
