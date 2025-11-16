export function DesignTokens() {
  return (
    <div className="space-y-8">
      {/* Colors */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Color Palette</h2>

        {/* Primary Colors */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Primary Colors</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ColorSwatch name="NSBE Green" hex="#00843D" variable="--color-primary" />
            <ColorSwatch name="Green Dark" hex="#006830" variable="--color-primary-dark" />
            <ColorSwatch name="Green Light" hex="#00A651" variable="--color-primary-light" />
            <ColorSwatch name="Green Pale" hex="#E8F5E9" variable="--color-primary-pale" />
          </div>
        </div>

        {/* Accent Colors */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Accent Colors</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ColorSwatch name="Gold" hex="#FFD700" variable="--color-gold" />
            <ColorSwatch name="Red" hex="#DC143C" variable="--color-red" />
            <ColorSwatch name="Black" hex="#000000" variable="--color-black" />
            <ColorSwatch name="White" hex="#FFFFFF" variable="--color-white" border />
          </div>
        </div>

        {/* Event Type Colors */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Event Type Colors</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <ColorSwatch name="Workshop" hex="#9333EA" variable="--color-workshop" />
            <ColorSwatch name="GBM" hex="#0EA5E9" variable="--color-gbm" />
            <ColorSwatch name="Community Service" hex="#10B981" variable="--color-service" />
          </div>
        </div>

        {/* Semantic Colors */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Semantic Colors</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ColorSwatch name="Success" hex="#10B981" variable="--color-success" />
            <ColorSwatch name="Warning" hex="#F59E0B" variable="--color-warning" />
            <ColorSwatch name="Error" hex="#EF4444" variable="--color-error" />
            <ColorSwatch name="Info" hex="#3B82F6" variable="--color-info" />
          </div>
        </div>

        {/* Gray Scale */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Gray Scale</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <ColorSwatch name="Gray 50" hex="#F9FAFB" variable="--color-gray-50" border />
            <ColorSwatch name="Gray 100" hex="#F3F4F6" variable="--color-gray-100" border />
            <ColorSwatch name="Gray 200" hex="#E5E7EB" variable="--color-gray-200" />
            <ColorSwatch name="Gray 300" hex="#D1D5DB" variable="--color-gray-300" />
            <ColorSwatch name="Gray 400" hex="#9CA3AF" variable="--color-gray-400" />
            <ColorSwatch name="Gray 500" hex="#6B7280" variable="--color-gray-500" />
            <ColorSwatch name="Gray 600" hex="#4B5563" variable="--color-gray-600" />
            <ColorSwatch name="Gray 700" hex="#374151" variable="--color-gray-700" />
            <ColorSwatch name="Gray 800" hex="#1F2937" variable="--color-gray-800" />
            <ColorSwatch name="Gray 900" hex="#111827" variable="--color-gray-900" />
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Typography</h2>

        <div className="space-y-6">
          <div className="pb-4 border-b border-gray-200">
            <p className="text-6xl font-bold text-gray-900 mb-2">Heading 1</p>
            <p className="text-sm text-gray-600">
              Font Size: 3.75rem (60px) • Line Height: 1 • Font Weight: 700
            </p>
          </div>

          <div className="pb-4 border-b border-gray-200">
            <p className="text-5xl font-bold text-gray-900 mb-2">Heading 2</p>
            <p className="text-sm text-gray-600">
              Font Size: 3rem (48px) • Line Height: 1 • Font Weight: 700
            </p>
          </div>

          <div className="pb-4 border-b border-gray-200">
            <p className="text-4xl font-bold text-gray-900 mb-2">Heading 3</p>
            <p className="text-sm text-gray-600">
              Font Size: 2.25rem (36px) • Line Height: 2.5rem • Font Weight: 700
            </p>
          </div>

          <div className="pb-4 border-b border-gray-200">
            <p className="text-3xl font-bold text-gray-900 mb-2">Heading 4</p>
            <p className="text-sm text-gray-600">
              Font Size: 1.875rem (30px) • Line Height: 2.25rem • Font Weight: 700
            </p>
          </div>

          <div className="pb-4 border-b border-gray-200">
            <p className="text-2xl font-bold text-gray-900 mb-2">Heading 5</p>
            <p className="text-sm text-gray-600">
              Font Size: 1.5rem (24px) • Line Height: 2rem • Font Weight: 700
            </p>
          </div>

          <div className="pb-4 border-b border-gray-200">
            <p className="text-xl font-bold text-gray-900 mb-2">Heading 6</p>
            <p className="text-sm text-gray-600">
              Font Size: 1.25rem (20px) • Line Height: 1.75rem • Font Weight: 700
            </p>
          </div>

          <div className="pb-4 border-b border-gray-200">
            <p className="text-lg text-gray-900 mb-2">Large Body</p>
            <p className="text-sm text-gray-600">
              Font Size: 1.125rem (18px) • Line Height: 1.75rem • Font Weight: 400
            </p>
          </div>

          <div className="pb-4 border-b border-gray-200">
            <p className="text-base text-gray-900 mb-2">Regular Body</p>
            <p className="text-sm text-gray-600">
              Font Size: 1rem (16px) • Line Height: 1.5rem • Font Weight: 400
            </p>
          </div>

          <div className="pb-4 border-b border-gray-200">
            <p className="text-sm text-gray-900 mb-2">Small Text</p>
            <p className="text-sm text-gray-600">
              Font Size: 0.875rem (14px) • Line Height: 1.25rem • Font Weight: 400
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-900 mb-2">Extra Small Text</p>
            <p className="text-sm text-gray-600">
              Font Size: 0.75rem (12px) • Line Height: 1rem • Font Weight: 400
            </p>
          </div>
        </div>
      </section>

      {/* Spacing */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Spacing Scale</h2>

        <div className="space-y-4">
          <SpacingExample size="0.125rem (2px)" value="0.5" />
          <SpacingExample size="0.25rem (4px)" value="1" />
          <SpacingExample size="0.5rem (8px)" value="2" />
          <SpacingExample size="0.75rem (12px)" value="3" />
          <SpacingExample size="1rem (16px)" value="4" />
          <SpacingExample size="1.25rem (20px)" value="5" />
          <SpacingExample size="1.5rem (24px)" value="6" />
          <SpacingExample size="2rem (32px)" value="8" />
          <SpacingExample size="2.5rem (40px)" value="10" />
          <SpacingExample size="3rem (48px)" value="12" />
          <SpacingExample size="4rem (64px)" value="16" />
        </div>
      </section>

      {/* Border Radius */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Border Radius</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <BorderRadiusExample label="None" value="0" radius="rounded-none" />
          <BorderRadiusExample label="Small" value="0.125rem (2px)" radius="rounded-sm" />
          <BorderRadiusExample label="Default" value="0.25rem (4px)" radius="rounded" />
          <BorderRadiusExample label="Medium" value="0.375rem (6px)" radius="rounded-md" />
          <BorderRadiusExample label="Large" value="0.5rem (8px)" radius="rounded-lg" />
          <BorderRadiusExample label="XL" value="0.75rem (12px)" radius="rounded-xl" />
          <BorderRadiusExample label="2XL" value="1rem (16px)" radius="rounded-2xl" />
          <BorderRadiusExample label="Full" value="9999px" radius="rounded-full" />
        </div>
      </section>

      {/* Shadows */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shadows</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ShadowExample label="Small" shadow="shadow-sm" />
          <ShadowExample label="Default" shadow="shadow" />
          <ShadowExample label="Medium" shadow="shadow-md" />
          <ShadowExample label="Large" shadow="shadow-lg" />
          <ShadowExample label="XL" shadow="shadow-xl" />
          <ShadowExample label="2XL" shadow="shadow-2xl" />
        </div>
      </section>
    </div>
  );
}

function ColorSwatch({
  name,
  hex,
  variable,
  border = false,
}: {
  name: string;
  hex: string;
  variable: string;
  border?: boolean;
}) {
  return (
    <div>
      <div
        className={`w-full h-20 rounded-lg mb-2 ${border ? "border-2 border-gray-200" : ""}`}
        style={{ backgroundColor: hex }}
      />
      <p className="text-sm font-medium text-gray-900">{name}</p>
      <p className="text-xs text-gray-500 font-mono">{hex}</p>
      <p className="text-xs text-gray-400 font-mono">{variable}</p>
    </div>
  );
}

function SpacingExample({ size, value }: { size: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-32 text-sm text-gray-600 font-mono">
        {value} = {size}
      </div>
      <div className="flex-1 bg-gray-100 rounded">
        <div
          className="bg-[#00843D] h-8 rounded"
          style={{ width: `${parseFloat(value) * 16}px` }}
        />
      </div>
    </div>
  );
}

function BorderRadiusExample({
  label,
  value,
  radius,
}: {
  label: string;
  value: string;
  radius: string;
}) {
  return (
    <div className="text-center">
      <div className={`w-full h-24 bg-[#00843D] ${radius} mb-2`} />
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-xs text-gray-500">{value}</p>
    </div>
  );
}

function ShadowExample({ label, shadow }: { label: string; shadow: string }) {
  return (
    <div className="text-center">
      <div className={`w-full h-24 bg-white rounded-lg ${shadow} mb-2 flex items-center justify-center`}>
        <span className="text-gray-400">{label}</span>
      </div>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-xs text-gray-500 font-mono">{shadow}</p>
    </div>
  );
}
