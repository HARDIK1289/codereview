import Link from "next/link";
import { Code2, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/20 backdrop-blur-sm pt-16 pb-8 relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-6 h-6 text-sky-400" />
              <span className="font-bold text-white text-lg">CodeVibe</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Building the standard for code readability. 
              Because code is meant to be understood by humans, not just compilers.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="#" className="hover:text-sky-400 transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-sky-400 transition-colors">Integrations</Link></li>
              <li><Link href="#" className="hover:text-sky-400 transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-sky-400 transition-colors">Changelog</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="#" className="hover:text-sky-400 transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-sky-400 transition-colors">API Reference</Link></li>
              <li><Link href="#" className="hover:text-sky-400 transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="#" className="hover:text-sky-400 transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-sky-400 transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-sky-400 transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-sky-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} CodeVibe Inc. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <Link href="#" className="text-slate-500 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-slate-500 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-slate-500 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}