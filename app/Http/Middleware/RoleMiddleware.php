<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Contoh: ->middleware("role:admin|pembimbing_pt")
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! Auth::check()) {
            return redirect()->guest(route('login'));
        }

        // Sebelumnya: redirect()->back() tanpa status 403. Request selain GET
        // dari role yang salah (mis. siswa memanggil endpoint admin) hanya
        // dikembalikan ke halaman sebelumnya, dan bisa berulang-ulang
        // (redirect loop) bila halaman sebelumnya juga ditolak.
        if (! Auth::user()->hasAnyRole(explode('|', $role))) {
            abort(403, 'Unauthorized.');
        }

        return $next($request);
    }
}
