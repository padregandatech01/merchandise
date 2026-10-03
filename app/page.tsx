"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";

type Variant = {
  variant_id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  stock_quantity: number | null;
  price: number | null;
};

type Product = {
  product_id: string;
  character_id: string | null;
  arc_id: string | null;
  product_name: string;
  category: "figurine" | "clothing" | "poster" | "other" | null;
  is_limited_edition: boolean | null;
  variants: Variant[];
  character_name?: string | null;
  arc_name?: string | null;
  title_name?: string | null;
};

const categories = ["All", "Figurines", "Clothing", "Posters", "Other"];

function money(value: number | null | undefined) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [cart, setCart] = useState<{ variant: Variant; product: Product; quantity: number }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [productResult, variantResult, characterResult, arcResult, titleResult] =
        await Promise.all([
          supabase
            .from("products")
            .select("product_id,character_id,arc_id,product_name,category,is_limited_edition")
            .order("product_name"),
          supabase
            .from("product_variants")
            .select("variant_id,product_id,size,color,stock_quantity,price"),
          supabase.from("characters").select("character_id,character_name,title_id"),
          supabase.from("arcs").select("arc_id,arc_name,title_id"),
          supabase.from("titles").select("title_id,title_name"),
        ]);

      if (!productResult.error) {
        const characters = new Map(
          (characterResult.data ?? []).map((x) => [x.character_id, x]),
        );
        const arcs = new Map((arcResult.data ?? []).map((x) => [x.arc_id, x]));
        const titles = new Map((titleResult.data ?? []).map((x) => [x.title_id, x]));

        const next = (productResult.data ?? []).map((product) => {
          const character = product.character_id
            ? characters.get(product.character_id)
            : undefined;
          const arc = product.arc_id ? arcs.get(product.arc_id) : undefined;
          const titleId = character?.title_id ?? arc?.title_id;
          return {
            ...product,
            variants: (variantResult.data ?? []).filter(
              (v) => v.product_id === product.product_id,
            ),
            character_name: character?.character_name ?? null,
            arc_name: arc?.arc_name ?? null,
            title_name: titleId ? titles.get(titleId)?.title_name ?? null : null,
          } as Product;
        });
        setProducts(next);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        category === "All" ||
        product.category === category.toLowerCase().replace(/s$/, "");
      const haystack = [
        product.product_name,
        product.character_name,
        product.arc_name,
        product.title_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesCategory && (!q || haystack.includes(q));
    });
  }, [products, category, search]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.variant.price ?? 0) * item.quantity,
    0,
  );

  function openProduct(product: Product) {
    const firstAvailable =
      product.variants.find((variant) => (variant.stock_quantity ?? 0) > 0) ??
      product.variants[0] ??
      null;
    setSelected(product);
    setSelectedVariant(firstAvailable);
  }

  function addToCart(product: Product, variant: Variant | null) {
    if (!variant) return;
    setCart((current) => {
      const existing = current.find((item) => item.variant.variant_id === variant.variant_id);
      if (existing) {
        return current.map((item) =>
          item.variant.variant_id === variant.variant_id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { product, variant, quantity: 1 }];
    });
    setCartOpen(true);
  }

  function toggleWishlist(id: string) {
    setWishlist((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#171717]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7f4ee]/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#" className="text-xl font-black tracking-tight">
            PADREGANDA<span className="text-[#e35d2f]">.</span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <a href="#shop" className="hover:text-[#e35d2f]">Shop</a>
            <a href="#collections" className="hover:text-[#e35d2f]">Collections</a>
            <a href="#about" className="hover:text-[#e35d2f]">About</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileNav((v) => !v)}
              className="rounded-full p-2 md:hidden"
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>
            <button className="rounded-full p-2" aria-label="Search" onClick={() => document.getElementById("catalog-search")?.focus()}>
              <Search size={20} />
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-full bg-black p-3 text-white"
              aria-label="Cart"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e35d2f] px-1 text-[10px] font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {mobileNav && (
          <div className="border-t border-black/10 px-5 py-4 md:hidden">
            <div className="flex flex-col gap-4 text-sm font-semibold">
              <a href="#shop" onClick={() => setMobileNav(false)}>Shop</a>
              <a href="#collections" onClick={() => setMobileNav(false)}>Collections</a>
              <a href="#about" onClick={() => setMobileNav(false)}>About</a>
            </div>
          </div>
        )}
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-20 pt-14 lg:grid-cols-[1.2fr_.8fr] lg:px-8 lg:pt-20">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[.16em]">
            <Sparkles size={13} /> Official merchandise
          </div>
          <h1 className="max-w-3xl text-5xl font-black leading-[.94] tracking-[-.05em] sm:text-7xl">
            Characters you love.
            <span className="text-[#e35d2f]"> Things worth keeping.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-black/60">
            Browse the Padreganda merchandise catalog, from limited figurines to
            everyday pieces inspired by the worlds in our library.
          </p>
          <a
            href="#shop"
            className="mt-8 flex w-fit items-center gap-3 rounded-full bg-black px-6 py-3.5 text-sm font-bold text-white transition hover:translate-x-1"
          >
            Explore catalog <ArrowRight size={17} />
          </a>
        </div>
        <div className="relative min-h-[330px] overflow-hidden rounded-[2rem] bg-[#1b2430] p-8 text-white">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#e35d2f]/80 blur-2xl" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[#e4c86a]/50 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="text-xs font-bold uppercase tracking-[.2em] text-white/60">The collection</div>
            <div>
              <div className="text-8xl font-black leading-none">∞</div>
              <p className="mt-3 max-w-xs text-sm leading-6 text-white/70">
                Built around titles, arcs, characters, products and variants—exactly
                the way the merchandise data model is organized.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#e35d2f]">Catalog</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Merchandise</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5">
              <Search size={16} className="text-black/40" />
              <input
                id="catalog-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog"
                className="w-44 bg-transparent text-sm outline-none placeholder:text-black/35"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto rounded-full bg-black p-1">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${category === item ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((x) => <div key={x} className="h-80 animate-pulse rounded-3xl bg-black/5" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-black/15 bg-white px-6 py-20 text-center">
            <ShoppingBag className="mx-auto mb-4 text-black/25" size={36} />
            <h3 className="text-xl font-black">Catalog is ready for its first drop.</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/50">
              Products are loaded directly from the Merchandise schema. Once products
              and variants are added to Supabase, they will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((product) => {
              const variant = product.variants[0];
              const price = variant?.price ?? 0;
              const inStock = product.variants.some((v) => (v.stock_quantity ?? 0) > 0);
              return (
                <article key={product.product_id} className="group">
                  <button onClick={() => openProduct(product)} className="relative block w-full overflow-hidden rounded-[1.7rem] bg-[#e7e1d6] text-left">
                    <div className="flex aspect-[4/5] items-center justify-center p-8">
                      <div className="flex h-40 w-40 items-center justify-center rounded-full border-[18px] border-black/5 bg-white/60 text-center text-xs font-black uppercase tracking-[.15em] text-black/25">
                        {product.category ?? "merch"}
                      </div>
                    </div>
                    {product.is_limited_edition && (
                      <span className="absolute left-4 top-4 rounded-full bg-[#e35d2f] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.12em] text-white">
                        Limited
                      </span>
                    )}
                    <span className={`absolute bottom-4 left-4 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.1em] ${inStock ? "bg-white" : "bg-black text-white"}`}>
                      {inStock ? "In stock" : "Unavailable"}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product.product_id); }}
                      className="absolute right-4 top-4 rounded-full bg-white p-2.5"
                      aria-label="Wishlist"
                    >
                      <Heart size={17} fill={wishlist.includes(product.product_id) ? "currentColor" : "none"} />
                    </button>
                  </button>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">{product.product_name}</h3>
                      <p className="mt-1 text-xs text-black/45">
                        {product.title_name ?? product.character_name ?? product.arc_name ?? "Collection"}
                      </p>
                    </div>
                    <span className="font-bold">{money(price)}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section id="collections" className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-20 sm:grid-cols-3 lg:px-8">
          {[
            ["01", "Titles", "Merchandise is connected back to the title it belongs to."],
            ["02", "Characters & arcs", "Products can reference a character or story arc."],
            ["03", "Variants", "Size, color, stock and price live at the variant level."],
          ].map(([number, title, body]) => (
            <div key={number}>
              <div className="text-sm font-black text-[#e35d2f]">{number}</div>
              <h3 className="mt-5 text-xl font-black">{title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-black/50">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer id="about" className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-12 text-sm text-black/50 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <span className="font-black text-black">PADREGANDA.</span>
        <span>Merchandise department</span>
      </footer>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6" onClick={() => setSelected(null)}>
          <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-t-[2rem] bg-[#f7f4ee] p-6 sm:rounded-[2rem] sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end">
              <button onClick={() => setSelected(null)} className="rounded-full bg-black/5 p-2"><X size={19} /></button>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="flex aspect-square items-center justify-center rounded-[1.7rem] bg-[#e7e1d6]">
                <div className="flex h-44 w-44 items-center justify-center rounded-full border-[20px] border-black/5 bg-white/60 text-center text-xs font-black uppercase tracking-[.15em] text-black/25">
                  {selected.category ?? "merch"}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#e35d2f]">{selected.category ?? "Merchandise"}</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">{selected.product_name}</h2>
                <p className="mt-2 text-sm text-black/50">
                  {[selected.title_name, selected.arc_name, selected.character_name].filter(Boolean).join(" · ") || "Padreganda collection"}
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {selected.variants.length ? selected.variants.map((variant) => (
                    <button
                      key={variant.variant_id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`rounded-full border px-4 py-2 text-xs font-bold ${selectedVariant?.variant_id === variant.variant_id ? "border-black bg-black text-white" : "border-black/10 bg-white"}`}
                    >
                      {[variant.size, variant.color].filter(Boolean).join(" / ") || "Standard"} · {money(variant.price)}
                    </button>
                  )) : <span className="text-sm text-black/40">No variants configured yet.</span>}
                </div>
                <div className="mt-7 flex items-center justify-between border-y border-black/10 py-5">
                  <span className="text-sm text-black/50">Selected price</span>
                  <span className="text-2xl font-black">{money(selectedVariant?.price)}</span>
                </div>
                <button
                  disabled={!selectedVariant || (selectedVariant.stock_quantity ?? 0) <= 0}
                  onClick={() => addToCart(selected, selectedVariant)}
                  className="mt-6 rounded-full bg-black px-6 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-black/15"
                >
                  {selectedVariant && (selectedVariant.stock_quantity ?? 0) > 0 ? "Add to cart" : "Unavailable"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40" onClick={() => setCartOpen(false)}>
          <aside className="ml-auto flex h-full w-full max-w-md flex-col bg-[#f7f4ee] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#e35d2f]">Your selection</p>
                <h2 className="mt-1 text-2xl font-black">Cart</h2>
              </div>
              <button onClick={() => setCartOpen(false)} className="rounded-full bg-black/5 p-2"><X size={19} /></button>
            </div>
            <div className="mt-8 flex-1 space-y-4 overflow-auto">
              {cart.length === 0 ? (
                <div className="py-20 text-center text-sm text-black/40">Your cart is empty.</div>
              ) : cart.map((item) => (
                <div key={item.variant.variant_id} className="flex gap-4 rounded-2xl bg-white p-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#e7e1d6] text-[9px] font-black uppercase text-black/25">
                    {item.product.category ?? "merch"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <p className="truncate text-sm font-bold">{item.product.product_name}</p>
                      <button onClick={() => setCart((c) => c.filter((x) => x.variant.variant_id !== item.variant.variant_id))}><X size={15} /></button>
                    </div>
                    <p className="mt-1 text-xs text-black/45">
                      {[item.variant.size, item.variant.color].filter(Boolean).join(" / ") || "Standard"}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-black/10 px-2 py-1">
                        <button onClick={() => setCart((c) => c.map((x) => x.variant.variant_id === item.variant.variant_id ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x))}><Minus size={13} /></button>
                        <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => setCart((c) => c.map((x) => x.variant.variant_id === item.variant.variant_id ? { ...x, quantity: x.quantity + 1 } : x))}><Plus size={13} /></button>
                      </div>
                      <span className="text-sm font-bold">{money((item.variant.price ?? 0) * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-black/10 pt-5">
              <div className="flex justify-between text-sm text-black/50"><span>Total</span><span className="font-black text-black">{money(cartTotal)}</span></div>
              <button className="mt-4 w-full rounded-full bg-black px-6 py-4 text-sm font-bold text-white disabled:bg-black/10" disabled={cart.length === 0}>
                Checkout
              </button>
              <p className="mt-3 text-center text-[11px] leading-5 text-black/35">
                Checkout and order persistence will be connected after the customer authentication/payment flow is defined.
              </p>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
