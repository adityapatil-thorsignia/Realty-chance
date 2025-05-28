import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User, Home, Search, Heart, Bell, LogIn, Plus, MapPin, Building, Star, BookmarkCheck, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Home className="h-6 w-6 text-primary animate-fade-in" />
            <span className="hidden font-bold text-xl md:inline-block animate-fade-in">RealtyChance</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Properties</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] grid-cols-2">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/50 to-primary p-6 no-underline outline-none focus:shadow-md"
                        to="/properties"
                      >
                        <Building className="h-6 w-6 text-white" />
                        <div className="mt-4 mb-2 text-lg font-medium text-white">
                          Properties
                        </div>
                        <p className="text-sm leading-tight text-white/90">
                          Browse our extensive collection of properties across India
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link to="/properties?type=buy" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Buy</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Find properties available for purchase
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link to="/properties?type=rent" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Rent</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Explore rentals across cities
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link to="/new-projects" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">New Projects</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Latest residential and commercial developments
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Locations</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <li>
                    <div className="mb-2 text-sm font-semibold text-muted-foreground">Trending Locations</div>
                    <div className="flex flex-col space-y-3 p-2">
                      {["Gurgaon", "Noida", "Bangalore", "Hyderabad", "Mumbai", "Pune"].map(city => (
                        <NavigationMenuLink asChild key={city}>
                          <Link
                            to={`/search?city=${city}`}
                            className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center">
                              <MapPin className="mr-2 h-3 w-3 text-secondary" />
                              <div className="text-sm font-medium leading-none">{city}</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </li>
                  <li>
                    <div className="mb-2 text-sm font-semibold text-muted-foreground">Popular Cities</div>
                    <div className="flex flex-col space-y-3 p-2">
                      {["Delhi NCR", "Chennai", "Kolkata", "Ahmedabad", "Lucknow", "Jaipur"].map(city => (
                        <NavigationMenuLink asChild key={city}>
                          <Link
                            to={`/search?city=${city}`}
                            className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center">
                              <MapPin className="mr-2 h-3 w-3" />
                              <div className="text-sm font-medium leading-none">{city}</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/search" className={cn(navigationMenuTriggerStyle())}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/new-projects" className={cn(navigationMenuTriggerStyle())}>
                <Star className="mr-2 h-4 w-4" />
                New Projects
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/favorites" className="relative p-2 rounded-full hover:bg-primary/10 transition-colors">
            <Heart className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-secondary rounded-full"></span>
          </Link>
          <Link to="/notifications" className="relative p-2 rounded-full hover:bg-primary/10 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-secondary rounded-full"></span>
          </Link>
          {isAuthenticated ? (
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogIn className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
          <Button size="sm" asChild>
            <Link to="/post-property">
              <Plus className="mr-2 h-4 w-4" />
              Post Property
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
          <span className="sr-only">Toggle menu</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="container md:hidden py-4 animate-fade-in">
          <nav className="flex flex-col space-y-4">
            <Link 
              to="/properties" 
              className="flex items-center text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              <Building className="mr-2 h-4 w-4" />
              Properties
            </Link>
            <Link 
              to="/search" 
              className="flex items-center text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Link>
            <Link 
              to="/new-projects" 
              className="flex items-center text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              <Star className="mr-2 h-4 w-4" />
              New Projects
            </Link>
            <Link 
              to="/favorites" 
              className="flex items-center text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              <Heart className="mr-2 h-4 w-4" />
              Favorites
            </Link>
            <Link 
              to="/notifications" 
              className="flex items-center text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Link>
            <Link 
              to="/post-property" 
              className="flex items-center text-sm font-medium text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Post Property
            </Link>
            <div className="pt-4 border-t">
              {isAuthenticated ? (
                <Button className="w-full" size="sm" onClick={() => { logout(); setIsMenuOpen(false); }}>
                  <User className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <Button className="w-full" size="sm" asChild>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <User className="mr-2 h-4 w-4" />
                    Login / Sign up
                  </Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
