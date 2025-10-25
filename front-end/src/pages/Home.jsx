import Hero from "../components/Hero";
import Products from "../components/Products";
import Features from "../components/Features";
import Team from "../components/Team";
import Introduction from "../components/Introduction";
import FloatingSocial from "../components/FloatingSocial";

export default function Home() {
  // Component CTA cũ đã được tích hợp vào các section khác, nên không cần nữa.
  return (
    <main>
      <Hero />
      <Introduction />
      <Products />
      <Features />
      <Team />
      <FloatingSocial />
    </main>
  );
}
