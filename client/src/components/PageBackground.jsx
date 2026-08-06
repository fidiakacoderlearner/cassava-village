const loginBg = import.meta.glob('/src/assets/login-bg.{png,jpg,jpeg,svg,webp,gif}', { eager: true });
const bgUrl = Object.values(loginBg)[0]?.default || null;

export default function PageBackground() {
  if (!bgUrl) {
    return <div className="fixed inset-0 -z-10 bg-gradient-to-br from-sand via-peach-light to-peach" />;
  }
  return (
    <>
      <img src={bgUrl} alt="" className="fixed inset-0 -z-10 h-full w-full object-cover" />
      <div className="fixed inset-0 -z-10 bg-brown-900/10" />
    </>
  );
}
