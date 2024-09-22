
export default function Home() {
  return (
    <>
      <div className="mb-12 mt-28 sm:mt-4an flex flex-col items-center justify-center text-center">

        <p className="txt-sm font-semibold text-gray-700">
          Gecko is now Public!
        </p>

        <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
          Find <span className="text-red-600">Vulnerabilities</span> in your
          Smart Contracts
        </h1>
        <p className="mt-5 max-w-prose text-white sm:text-lg">
          Gecko automatically finds security vulnerabilities in your contracts.
          Simply upload your contract and Gecko will find and remediate bugs.
        </p>
      </div>
    </>
  );
}
