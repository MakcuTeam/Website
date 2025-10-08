"use client";
import { ThemeProvider } from "@/components/contexts/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ClientDictionary } from "@/components/contexts/dictionary-provider";
import { Toaster } from "@/components/ui/sonner";
import { Provider, useDispatch } from "react-redux";
import store from "@/store";
import { useEffect } from "react";
import { fetchDiscordData } from "@/store/discordSlice";
import { Dictionary } from "@/lib/dictionaries";

export default function RootLayoutProvider({
  children,
  dict,
}: Readonly<
  {
    children: React.ReactNode;
  } & { dict: Dictionary }
>) {
  return (
    <Provider store={store}>
      <RootLayoutContent dict={dict}>{children}</RootLayoutContent>
    </Provider>
  );
}

function RootLayoutContent({
  children,
  dict,
}: {
  children: React.ReactNode;
  dict: Dictionary;
}) {
  const dispatch = useDispatch<typeof store.dispatch>();

  useEffect(() => {
    dispatch(fetchDiscordData("/guilds/1274444245184282654/widget.json"));
  }, [dispatch]);

  return (
    <>
      <Toaster />
      <ClientDictionary dict={dict}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar dict={dict} />
          <main className="sm:container mx-auto w-[90vw] h-auto scroll-smooth">
            {children}
          </main>
            <Footer />
        </ThemeProvider>
      </ClientDictionary>
    </>
  );
}
