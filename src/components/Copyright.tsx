
const Copyright = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="mt-auto py-4 text-center text-sm text-gray-500">
      © {year} KukuHub. All rights reserved.
    </footer>
  );
};

export default Copyright;
