#pragma once
#include "CoreMinimal.h"
/// Pure charge state; capacity supplied by the caller, not a gameplay constant.
struct FChargeModel
{
	int32 Capacity;
	int32 Current;
	explicit FChargeModel(int32 Initial) : Capacity(FMath::Max(0, Initial)), Current(Capacity) {}
	bool Spend() { if (Current == 0) return false; --Current; return true; }
	void Reset() { Current = Capacity; }
};
