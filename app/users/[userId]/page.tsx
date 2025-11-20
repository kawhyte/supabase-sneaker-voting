import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfileView } from "@/components/social/UserProfile/PublicProfileView";

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
    const response = await fetch(`${baseUrl}/api/social/users/${userId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        title: "User Not Found",
      };
    }

    const data = await response.json();
    const userName = data.profile?.name || "User";

    return {
      title: `${userName}'s Wishlist | PurrView`,
      description: `Check out ${userName}'s wishlist on PurrView`,
      openGraph: {
        title: `${userName}'s Wishlist`,
        description: `Check out ${userName}'s wishlist on PurrView`,
        type: "profile",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "User Profile",
    };
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const { userId } = await params;

  try {
    // Fetch profile data from API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
    const response = await fetch(`${baseUrl}/api/social/users/${userId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        notFound();
      }
      throw new Error("Failed to fetch profile");
    }

    const data = await response.json();

    return <PublicProfileView data={data} />;
  } catch (error) {
    console.error("Error loading profile:", error);
    notFound();
  }
}
