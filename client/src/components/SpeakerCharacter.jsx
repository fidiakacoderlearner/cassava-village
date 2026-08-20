import AssetImage from './AssetImage.jsx';

export default function SpeakerCharacter({ speakerId, speaker }) {
  const name = speaker?.name || 'Pak Restu';
  const emoji = speaker?.emoji || '🧑‍🌾';
  const assetName = speakerId;

  return (
    <div className="relative flex shrink-0 items-end justify-center self-end">
      <AssetImage
        name={assetName}
        alt={name}
        className="h-32 w-20 object-contain object-bottom filter drop-shadow-lg sm:h-40 sm:w-24 md:h-48 md:w-28 lg:h-56 lg:w-32 xl:h-64 xl:w-40 2xl:h-72 2xl:w-48"
        fallback={
          <div className="flex h-28 w-16 flex-col items-center justify-end p-2 sm:h-36 sm:w-20 sm:p-2 md:h-44 md:w-24 lg:h-52 lg:w-28">
            <span className="text-4xl drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">{emoji}</span>
          </div>
        }
      />
    </div>
  );
}
