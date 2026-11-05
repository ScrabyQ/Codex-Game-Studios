#include "ChargeModel.h"
#include "Misc/AutomationTest.h"
#if WITH_DEV_AUTOMATION_TESTS
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FChargeModelTest, "CGS27.ChargeModel.Bounds", EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)
bool FChargeModelTest::RunTest(const FString& Parameters)
{
	FChargeModel Model(3);
	TestEqual(TEXT("Initial"), Model.Current, 3);
	TestTrue(TEXT("Spend first"), Model.Spend());
	Model.Spend(); Model.Spend();
	TestEqual(TEXT("Empty"), Model.Current, 0);
	TestFalse(TEXT("No underflow"), Model.Spend());
	Model.Reset();
	TestEqual(TEXT("Reset"), Model.Current, 3);
	return true;
}
#endif
