import Image from 'next/image'

export default function Home() {
  const svgs = [
    // 'archive.svg',
    // 'bearbody.svg',
    // 'bear_head.svg',
    // 'blood.svg',
    // 'cloud.svg',
    // 'letter.svg',
    // 'note1.svg',
    // 'note2.svg',
    // 'paper.svg',
    // 'record.svg',
    // 'share.svg',
    // 'coffin.svg',
    // 'stick.svg',
    'all-white.svg',
    'today-white.svg',
    'all-dark.svg',
    'today-dark.svg',
  ]

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, #7CD7FF 50%, #90E050 50%)',
        zIndex: -1
      }} />
      
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">SVG Preview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {svgs.map((svg) => (
            <div key={svg} className="flex flex-col items-center">
              <div className="w-[100px] h-[100px] relative">
                <Image
                  src={`/${svg}`}
                  alt={svg.replace('.svg', '')}
                  fill
                  className="object-contain"
                />
              </div>
              <p className="mt-2 text-sm">{svg}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
