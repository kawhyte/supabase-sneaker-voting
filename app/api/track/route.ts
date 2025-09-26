import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import * as cheerio from 'cheerio'

const metascraper = require('metascraper')([
  require('metascraper-image')(),
  require('metascraper-title')(),
]);

async function getPrice(html: string, url: string) {
  const $ = cheerio.load(html);
  const priceString =
    $('meta[property="product:price:amount"]').attr('content') ||
    $('[itemprop*="price"]').attr('content') ||
    $('.price').text() ||
    $('#price').text();

  if (priceString) {
    const price = parseFloat(priceString.replace(/[^0-9.-]+/g, ''));
    return price;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const { productUrl } = await request.json();

  if (!productUrl) {
    return NextResponse.json({ error: 'productUrl is required' }, { status: 400 });
  }

  // Create a Supabase client for Route Handlers
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
      },
    }
  )

  try {
    const response = await fetch(productUrl);
    const html = await response.text();
    const metadata = await metascraper({ html, url: productUrl });
    const price = await getPrice(html, productUrl);

    const { data: existingStoreLink, error: existingStoreLinkError } = await supabase
      .from('store_links')
      .select('id')
      .eq('url', productUrl)
      .single();

    if (existingStoreLink) {
      return NextResponse.json({ error: 'Product is already being tracked.' }, { status: 400 });
    }

    let itemId: string;

    const { data: existingItem, error: existingItemError } = await supabase
      .from('items')
      .select('id')
      .ilike('title', `%${metadata.title}%`)
      .single();

    if (existingItem) {
      itemId = existingItem.id;
    } else {
      const { data: newItem, error: newItemError } = await supabase
        .from('items')
        .insert({
          title: metadata.title,
          image_url: metadata.image,
          brand: null,
          sku: null,
          owner_id: null,
        })
        .select('id')
        .single();

      if (newItemError) {
        throw newItemError;
      }
      itemId = newItem.id;
    }

    const { data: newStoreLink, error: newStoreLinkError } = await supabase
      .from('store_links')
      .insert({
        item_id: itemId,
        url: productUrl,
        store_name: new URL(productUrl).hostname,
        last_price: price,
        in_stock: price !== null,
        last_checked: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (newStoreLinkError) {
      throw newStoreLinkError;
    }

    const { error: priceHistoryError } = await supabase.from('price_history').insert({
      store_link_id: newStoreLink.id,
      price: price,
      in_stock: price !== null,
    });

    if (priceHistoryError) {
      throw priceHistoryError;
    }

    return NextResponse.json({
      title: metadata.title,
      price: price,
      image: metadata.image,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to scrape product data.' }, { status: 500 });
  }
}