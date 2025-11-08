import BubbleComments from "../components/BubbleComments";
import CitySearch from "../components/CitySearch";

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <h1 className="hero-title"> Choose your Roman Colosseum Tour.</h1>
        <h2 className="hero-subtitle">
        Pick your tour and we'll show the way!
        </h2>
        <BubbleComments
          comments={[
            { text: "Let's go Colosseum?" },
            { text: "Booked your Ticket?" },
            { text: "Roman Forum today?" },
            { text: "Palatine Hill Now?" }
          ]}
        />
        <div className="city-search-container">
          <CitySearch />
        </div>
        <div className="cancellation-text">
          Flexible Booking and Free Cancellation
        </div>
      </div>
    </section>
  );
}
