export default function Newsletter() {
  return (
    <main className="min-h-svh container flex justify-center items-center flex-col pt-24 pb-20 lg:pt-40">
      <div className="flex flex-col items-center text-center max-w-md w-full px-gutter">
        <h1 className="text-h3 text-red pb-10 lg:pb-16">Join our newsletter</h1>
        <input
          className="w-full px-8 py-4 border-2 bg-black border-red"
          type="email"
          placeholder="Email"
        />
        <button className="mt-8 w-full button">Subscribe</button>
      </div>
    </main>
  );
}
