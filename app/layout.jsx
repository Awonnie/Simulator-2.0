import "@/styles/custom-styles.css";
import "@/styles/globals.css";
import NavBarDrawer from "./NavBarDrawer";

export const metadata = {
  title: "MDPGrp7",
  description: "Welcome to our Algorithm Simulator!",
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}) {
  return (
    <html lang="en">
      <body className="no-scrollbar">
        <NavBarDrawer />
        {children}
      </body>
    </html>
  );
}
