// Data layer — fetches from Supabase, falls back to local data
import { supabase } from './supabase.js';

// Local fallback data imports
import { product as localProduct } from '../data/products.js';
import { testimonials as localTestimonials } from '../data/testimonials.js';
import { affiliateTiers as localAffiliateTiers, affiliateProgram as localAffiliateProgram } from '../data/affiliateTiers.js';
import { processSteps as localProcessSteps } from '../data/processSteps.js';

/**
 * Fetch product + benefits from Supabase
 */
export async function fetchProduct() {
    try {
        const { data: products, error: pErr } = await supabase
            .from('products')
            .select('*')
            .limit(1)
            .single();

        if (pErr) throw pErr;

        const { data: benefits, error: bErr } = await supabase
            .from('product_benefits')
            .select('*')
            .eq('product_id', products.id)
            .order('sort_order');

        if (bErr) throw bErr;

        // Map to match existing data shape
        return {
            id: products.id,
            name: products.name,
            brand: products.brand,
            tagline: products.tagline,
            shortDescription: products.short_description,
            description: products.description,
            price: products.price,
            priceFormatted: products.price_formatted,
            unit: products.unit,
            capsuleCount: products.capsule_count,
            capsuleUnit: products.capsule_unit,
            ingredients: products.ingredients || [],
            benefits: (benefits || []).map(b => ({
                icon: b.icon,
                title: b.title,
                desc: b.description,
            })),
            usage: products.usage_instructions,
            storage: products.storage,
            certification: products.certification,
            origin: products.origin,
        };
    } catch (err) {
        console.warn('⚠️ Supabase fetch failed for products, using local fallback:', err.message);
        return localProduct;
    }
}

/**
 * Fetch testimonials from Supabase
 */
export async function fetchTestimonials() {
    try {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('id');

        if (error) throw error;
        return data;
    } catch (err) {
        console.warn('⚠️ Supabase fetch failed for testimonials, using local fallback:', err.message);
        return localTestimonials;
    }
}

/**
 * Fetch process steps from Supabase
 */
export async function fetchProcessSteps() {
    try {
        const { data, error } = await supabase
            .from('process_steps')
            .select('*')
            .order('sort_order');

        if (error) throw error;
        return data;
    } catch (err) {
        console.warn('⚠️ Supabase fetch failed for process_steps, using local fallback:', err.message);
        return localProcessSteps;
    }
}

/**
 * Fetch affiliate tiers from Supabase
 */
export async function fetchAffiliateTiers() {
    try {
        const { data, error } = await supabase
            .from('affiliate_tiers')
            .select('*')
            .order('sort_order');

        if (error) throw error;

        // Map to match existing data shape
        return data.map(t => ({
            id: t.id,
            name: t.name,
            icon: t.icon,
            minSales: t.min_sales,
            maxSales: t.max_sales,
            commission: t.commission,
            color: t.color,
            gradient: t.gradient,
            perks: t.perks || [],
        }));
    } catch (err) {
        console.warn('⚠️ Supabase fetch failed for affiliate_tiers, using local fallback:', err.message);
        return localAffiliateTiers;
    }
}

/**
 * Fetch affiliate steps (how it works)
 */
export async function fetchAffiliateSteps() {
    try {
        const { data, error } = await supabase
            .from('affiliate_steps')
            .select('*')
            .order('sort_order');

        if (error) throw error;

        return data.map(s => ({
            step: s.step,
            title: s.title,
            desc: s.description,
        }));
    } catch (err) {
        console.warn('⚠️ Supabase fetch failed for affiliate_steps, using local fallback:', err.message);
        return localAffiliateProgram.howItWorks;
    }
}

/**
 * Fetch ALL data at once
 */
export async function fetchAllData() {
    const [product, testimonials, processSteps, affiliateTiers, affiliateSteps] = await Promise.all([
        fetchProduct(),
        fetchTestimonials(),
        fetchProcessSteps(),
        fetchAffiliateTiers(),
        fetchAffiliateSteps(),
    ]);

    return { product, testimonials, processSteps, affiliateTiers, affiliateSteps };
}
