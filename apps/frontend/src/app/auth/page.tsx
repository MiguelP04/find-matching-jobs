"use client";

import "reflect-metadata";
import { useForm } from "react-hook-form";
import { useState, useMemo } from "react";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { RegisterDto, LoginDto } from "@find-matching-jobs/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Mail, Lock, LogIn, Eye, EyeOff, GraduationCap, LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Image from "next/image";

export default function AuthPage() {
  const router = useRouter();
  const { login, register: registerUser, error, clearError, isAuthenticated } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resolver = useMemo(
    () => classValidatorResolver(isRegister ? RegisterDto : LoginDto),
    [isRegister],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<any>({ resolver });

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      if (isRegister) {
        await registerUser({
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          password: data.password,
        });
        setIsRegister(false);
        reset();
      } else {
        await login(data.email, data.password);
        router.replace("/dashboard");
      }
    } catch {
      // error is already in store.error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen">
      <div className="hidden md:flex w-1/2 relative overflow-hidden bg-secondary">
        <Image
          src="/auth_image.jpg"
          alt="Auth Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/95 to-primary/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12">
          <GraduationCap className="size-14 text-primary mb-4" />
          <h2 className="text-3xl font-bold text-center leading-tight">
            Encuentra tu próxima oportunidad
          </h2>
          <p className="text-base text-center mt-3 text-white/70 max-w-xs">
            Conectamos estudiantes a empresas que buscan tu talento
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-6 bg-white">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <Tabs
            value={isRegister ? "register" : "login"}
            onValueChange={(value) => {
              setIsRegister(value === "register");
              reset();
              clearError();
            }}
          >
            <TabsList className="w-full grid grid-cols-2 h-12">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <div className="mt-6 text-center">
              <h1 className="text-xl font-bold text-foreground">
                {isRegister ? "Crear cuenta" : "Bienvenido de nuevo"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isRegister
                  ? "Regístrate para empezar"
                  : "Ingresa tus credenciales institucionales"}
              </p>
            </div>

            <form
              key={isRegister ? "register" : "login"}
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 flex flex-col gap-4 animate-fade-up"
            >
              <TabsContent value="register" className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Nombre
                    </label>
                    <Input
                      type="text"
                      placeholder="Nombre"
                      className="h-10"
                      {...register("nombre")}
                    />
                    {errors.nombre && (
                      <p className="text-xs text-red-500">
                        {errors.nombre.message as string}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Apellido
                    </label>
                    <Input
                      type="text"
                      placeholder="Apellido"
                      className="h-10"
                      {...register("apellido")}
                    />
                    {errors.apellido && (
                      <p className="text-xs text-red-500">
                        {errors.apellido.message as string}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      className="h-10 pl-8"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message as string}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      className="h-10 pl-8 pr-8"
                      {...register("password")}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500">
                      {errors.password.message as string}
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="login" className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      className="h-10 pl-8"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message as string}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      className="h-10 pl-8 pr-8"
                      {...register("password")}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="text-xs text-red-500">
                      {errors.password.message as string}
                    </p>
                  )}
                </div>
              </TabsContent>

              {!isRegister && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                    <Checkbox
                      checked={remember}
                      onCheckedChange={(checked) =>
                        setRemember(checked === true)
                      }
                    />
                    Recordarme
                  </label>
                  <span className="text-muted-foreground cursor-not-allowed">
                    ¿Olvidaste tu contraseña?
                  </span>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={submitting} className="h-11">
                  {submitting ? (
                    <LoaderCircle className="size-5 animate-spin" />
                  ) : (
                    <>
                      {isRegister ? "Crear cuenta" : "Iniciar sesión"}
                      <LogIn />
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex-1 h-px bg-border" />
                  <span>Acceso alternativo</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => {
                    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
                  }}
                >
                  {isRegister
                    ? "Registrarse con Google"
                    : "Iniciar sesión con Google"}
                </Button>
              </div>
            </form>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
